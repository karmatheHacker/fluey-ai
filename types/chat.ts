export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    isStreaming?: boolean;
    failed?: boolean;
}