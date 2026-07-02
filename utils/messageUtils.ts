let messageCounter = 0;

export const generateMessageId = () => {
    messageCounter += 1;
    return `msg_${Date.now()}_${messageCounter}`;
};