"use client";

import { useEffect, useRef, useState } from "react";
import type { AppSocket } from "@/lib/socket";
import type { MediaState, Participant, RtcSignalData } from "@/lib/types";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

export type MediaKind = "audio" | "video";

interface Peer {
  pc: RTCPeerConnection;
  polite: boolean;
  makingOffer: boolean;
  ignoreOffer: boolean;
}

interface Options {
  socket: AppSocket | null;
  selfId: string | null;
  participants: Participant[];
  onSignal: (to: string, data: RtcSignalData) => void;
  onStateChange: (state: MediaState) => void;
}

const OFF: MediaState = { audio: false, video: false };

export const useMediaCall = ({
  socket,
  selfId,
  participants,
  onSignal,
  onStateChange,
}: Options) => {
  const peers = useRef(new Map<string, Peer>());
  const local = useRef<MediaStream | null>(null);
  const selfIdRef = useRef(selfId);
  const stateRef = useRef<MediaState>(OFF);
  const callbacks = useRef({ onSignal, onStateChange });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [state, setState] = useState<MediaState>(OFF);
  const [busy, setBusy] = useState<MediaKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    selfIdRef.current = selfId;
  }, [selfId]);

  useEffect(() => {
    callbacks.current = { onSignal, onStateChange };
  }, [onSignal, onStateChange]);

  const getLocal = () => {
    if (!local.current) local.current = new MediaStream();
    return local.current;
  };

  const closePeer = (id: string) => {
    const peer = peers.current.get(id);
    if (!peer) return;
    peer.pc.onnegotiationneeded = null;
    peer.pc.onicecandidate = null;
    peer.pc.ontrack = null;
    peer.pc.onconnectionstatechange = null;
    peer.pc.close();
    peers.current.delete(id);
    setRemoteStreams((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const createPeer = (id: string): Peer => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const peer: Peer = {
      pc,
      polite: (selfIdRef.current ?? "") < id,
      makingOffer: false,
      ignoreOffer: false,
    };

    const stream = local.current;
    if (stream) for (const track of stream.getTracks()) pc.addTrack(track, stream);

    pc.onnegotiationneeded = async () => {
      try {
        peer.makingOffer = true;
        await pc.setLocalDescription();
        if (pc.localDescription) {
          callbacks.current.onSignal(id, { description: pc.localDescription.toJSON() });
        }
      } catch (err) {
        console.error("[rtc] negotiation failed", err);
      } finally {
        peer.makingOffer = false;
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      callbacks.current.onSignal(id, { candidate: candidate ? candidate.toJSON() : null });
    };

    pc.ontrack = ({ streams }) => {
      const remote = streams[0];
      if (!remote) return;
      const publish = () => setRemoteStreams((prev) => ({ ...prev, [id]: remote }));
      remote.onaddtrack = publish;
      remote.onremovetrack = publish;
      publish();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") pc.restartIce();
    };

    peers.current.set(id, peer);
    return peer;
  };

  const getPeer = (id: string) => peers.current.get(id) ?? createPeer(id);

  const handleSignal = async ({ from, data }: { from: string; data: RtcSignalData }) => {
    const peer = getPeer(from);
    const { pc } = peer;

    try {
      if (data.description) {
        const description = data.description;
        const collision =
          description.type === "offer" && (peer.makingOffer || pc.signalingState !== "stable");
        peer.ignoreOffer = !peer.polite && collision;
        if (peer.ignoreOffer) return;

        await pc.setRemoteDescription(description);
        if (description.type === "offer") {
          await pc.setLocalDescription();
          if (pc.localDescription) {
            callbacks.current.onSignal(from, { description: pc.localDescription.toJSON() });
          }
        }
      } else if (data.candidate !== undefined) {
        try {
          if (data.candidate) await pc.addIceCandidate(data.candidate);
          else await pc.addIceCandidate();
        } catch (err) {
          if (!peer.ignoreOffer) throw err;
        }
      }
    } catch (err) {
      console.error("[rtc] signal failed", err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const onSignal = (payload: { from: string; data: RtcSignalData }) => void handleSignal(payload);
    socket.on("rtc:signal", onSignal);
    return () => {
      socket.off("rtc:signal", onSignal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const otherIds = participants
    .map((p) => p.id)
    .filter((id) => id !== selfId)
    .sort()
    .join(",");

  useEffect(() => {
    const ids = new Set(otherIds ? otherIds.split(",") : []);
    for (const id of [...peers.current.keys()]) if (!ids.has(id)) closePeer(id);

    const sharing = (local.current?.getTracks().length ?? 0) > 0;
    if (sharing) for (const id of ids) getPeer(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherIds]);

  useEffect(() => {
    const peerMap = peers.current;
    const localRef = local;
    return () => {
      for (const peer of peerMap.values()) peer.pc.close();
      peerMap.clear();
      for (const track of localRef.current?.getTracks() ?? []) track.stop();
      localRef.current = null;
    };
  }, []);

  const publishState = (next: MediaState) => {
    stateRef.current = next;
    setState(next);
    callbacks.current.onStateChange(next);
  };

  const disable = (kind: MediaKind) => {
    const stream = local.current;
    if (!stream) return;

    const tracks = kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
    for (const track of tracks) {
      track.onended = null;
      track.stop();
      stream.removeTrack(track);
      for (const peer of peers.current.values()) {
        for (const sender of peer.pc.getSenders()) {
          if (sender.track === track) peer.pc.removeTrack(sender);
        }
      }
    }

    publishState({ ...stateRef.current, [kind]: false });
  };

  const enable = async (kind: MediaKind) => {
    if (busy) return;
    setBusy(kind);
    setError(null);

    try {
      const constraints: MediaStreamConstraints =
        kind === "audio"
          ? { audio: { echoCancellation: true, noiseSuppression: true } }
          : { video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" } };
      const captured = await navigator.mediaDevices.getUserMedia(constraints);
      const track = captured.getTracks()[0];
      if (!track) return;

      const stream = getLocal();
      stream.addTrack(track);
      track.onended = () => disable(kind);

      const ids = otherIds ? otherIds.split(",") : [];
      for (const id of ids) {
        const { pc } = getPeer(id);
        const alreadySending = pc.getSenders().some((s) => s.track === track);
        if (!alreadySending) pc.addTrack(track, stream);
      }

      setLocalStream(stream);
      publishState({ ...stateRef.current, [kind]: true });
    } catch (err) {
      const denied = err instanceof DOMException && err.name === "NotAllowedError";
      setError(
        kind === "audio"
          ? denied
            ? "Microphone access was blocked"
            : "Couldn't start the microphone"
          : denied
            ? "Camera access was blocked"
            : "Couldn't start the camera",
      );
    } finally {
      setBusy(null);
    }
  };

  const toggle = (kind: MediaKind) => {
    if (stateRef.current[kind]) disable(kind);
    else void enable(kind);
  };

  const stopAll = () => {
    disable("audio");
    disable("video");
  };

  return { localStream, remoteStreams, state, busy, error, toggle, stopAll };
};
