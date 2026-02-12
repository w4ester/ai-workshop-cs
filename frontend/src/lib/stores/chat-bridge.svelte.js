/**
 * Chat Bridge — Svelte 5 rune-based store for page → Chat communication
 *
 * Usage from a page:
 *   import { sendToChat } from '$lib/stores/chat-bridge.svelte.js';
 *   sendToChat("Create a lesson about...");
 *
 * Usage from Chat.svelte:
 *   import { chatBridge, consumeMessage } from '$lib/stores/chat-bridge.svelte.js';
 *   $effect(() => { if (chatBridge.shouldOpen) { ... consumeMessage(); } });
 */

let pendingMessage = $state('');
let shouldOpen = $state(false);

export const chatBridge = {
	get pendingMessage() { return pendingMessage; },
	get shouldOpen() { return shouldOpen; }
};

/** Send a message to the Chat panel (opens it automatically) */
export function sendToChat(message) {
	pendingMessage = message;
	shouldOpen = true;
}

/** Chat reads and clears the pending message */
export function consumeMessage() {
	const msg = pendingMessage;
	pendingMessage = '';
	shouldOpen = false;
	return msg;
}
