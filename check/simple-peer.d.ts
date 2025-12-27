declare module 'simple-peer' {
    import { Instance } from 'simple-peer';
    export = Peer;

    interface Options {
        initiator?: boolean;
        channelName?: string;
        channelConfig?: any;
        trickle?: boolean;
        stream?: MediaStream;
        config?: RTCConfiguration;
        offerOptions?: RTCOfferOptions;
        answerOptions?: RTCAnswerOptions;
        sdpTransform?: (sdp: string) => string;
        wrtc?: any;
        objectMode?: boolean;
    }

    class Peer {
        constructor(opts?: Options);
        signal(data: any): void;
        destroy(onclose?: () => void): void;
        on(event: string, listener: (...args: any[]) => void): void;
        on(event: 'signal', listener: (data: any) => void): void;
        on(event: 'stream', listener: (stream: MediaStream) => void): void;
        on(event: 'data', listener: (data: any) => void): void;
        on(event: 'close', listener: () => void): void;
        on(event: 'error', listener: (err: Error) => void): void;
        on(event: 'connect', listener: () => void): void;
        send(data: any): void;
        addStream(stream: MediaStream): void;
        removeStream(stream: MediaStream): void;
        addTrack(track: MediaStreamTrack, stream: MediaStream): void;
        removeTrack(track: MediaStreamTrack, stream: MediaStream): void;
        replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack, stream: MediaStream): void;

        readonly _id: string; // Internal id often used
        destroy(): void;
    }

    namespace Peer {
        interface Instance extends Peer { }
    }
}
