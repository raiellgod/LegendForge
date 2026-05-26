import type { FormEvent } from "react";

import type {
  CampaignParticipant,
  ChatMessage,
  ChatMode,
  User,
} from "../types/game-table-types";

import { getParticipantDisplayName } from "../utils/user-utils";

type TableChatPanelProps = {
  user: User;
  chatMessages: ChatMessage[];
  chatMode: ChatMode;
  whisperTargets: CampaignParticipant[];
  whisperTargetId: string;
  chatInput: string;
  chatError: string;
  onChangeChatMode: (mode: ChatMode) => void;
  onChangeWhisperTargetId: (targetId: string) => void;
  onChangeChatInput: (value: string) => void;
  onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void;
};

export function TableChatPanel({
  user,
  chatMessages,
  chatMode,
  whisperTargets,
  whisperTargetId,
  chatInput,
  chatError,
  onChangeChatMode,
  onChangeWhisperTargetId,
  onChangeChatInput,
  onSubmitMessage,
}: TableChatPanelProps) {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 text-[13px]">
        <section>
          <h2 className="text-base font-black text-forge-gold">Chat</h2>

          <p className="mt-1 text-xs font-semibold text-white/55">
            Conversas da mesa, avisos do sistema, rolagens públicas e sussurros.
          </p>

          <div className="mt-5 space-y-3">
            {chatMessages.map((message) => {
              const isSelfWhisper =
                message.kind === "whisper" && message.recipientId === user.id;

              return (
                <div
                  key={message.id}
                  className={`rounded-xl border p-3 ${
                    message.kind === "roll"
                      ? "border-forge-gold/40 bg-forge-purple/30"
                      : message.kind === "whisper"
                        ? isSelfWhisper
                          ? "border-forge-gold/35 bg-forge-gold/10"
                          : "border-purple-300/35 bg-purple-950/30"
                        : "border-white/10 bg-black/35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-[11px] font-black ${
                        message.kind === "system"
                          ? "text-forge-gold"
                          : message.kind === "whisper"
                            ? isSelfWhisper
                              ? "text-forge-gold"
                              : "text-purple-200"
                            : "text-purple-200"
                      }`}
                    >
                      {message.author}
                    </p>

                    {message.kind === "whisper" && (
                      <span
                        className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                          isSelfWhisper
                            ? "border-forge-gold/40 bg-black/30 text-forge-gold"
                            : "border-purple-300/30 bg-purple-950/50 text-purple-100"
                        }`}
                      >
                        {isSelfWhisper ? "Nota pessoal" : "Sussurro"}
                      </span>
                    )}
                  </div>

                  {message.kind === "roll" ? (
                    <div className="mt-2">
                      <p className="text-xs text-white/75">{message.content}</p>

                      <p className="mt-2 text-4xl font-black text-forge-gold">
                        {message.displayResult ?? message.result}
                      </p>

                      <p className="text-xs font-semibold text-white/55">
                        {message.breakdown}
                      </p>
                    </div>
                  ) : message.kind === "whisper" ? (
                    <div className="mt-2">
                      <p className="text-[11px] font-bold text-purple-100/65">
                        Para: {message.recipientName}
                      </p>

                      <p className="mt-1 text-xs text-white/80">
                        {message.content}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-white/75">
                      {message.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <form
        onSubmit={onSubmitMessage}
        className="shrink-0 border-t border-forge-gold/25 p-4"
      >
        <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg border border-forge-gold/20 bg-black/25 p-1">
          <button
            type="button"
            onClick={() => onChangeChatMode("public")}
            className={`rounded-md px-2 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
              chatMode === "public"
                ? "bg-forge-purple text-forge-gold"
                : "text-white/45 hover:text-forge-gold"
            }`}
          >
            Público
          </button>

          <button
            type="button"
            onClick={() => onChangeChatMode("whisper")}
            className={`rounded-md px-2 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
              chatMode === "whisper"
                ? "bg-forge-purple text-forge-gold"
                : "text-white/45 hover:text-forge-gold"
            }`}
          >
            Sussurro
          </button>
        </div>

        {chatMode === "whisper" && (
          <select
            value={whisperTargetId}
            onChange={(event) => onChangeWhisperTargetId(event.target.value)}
            aria-label="Escolher destinatário do sussurro"
            title="Escolher destinatário do sussurro"
            className="mb-3 h-10 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-semibold text-white outline-none focus:border-forge-gold"
          >
            <option value="">Escolha o destinatário</option>

            {whisperTargets.map((participant) => (
              <option key={participant.id} value={participant.userId}>
                {getParticipantDisplayName(participant)}
              </option>
            ))}
          </select>
        )}

        {chatError ? (
          <p className="mb-3 rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-200">
            {chatError}
          </p>
        ) : null}

        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(event) => onChangeChatInput(event.target.value)}
            placeholder={
              chatMode === "whisper"
                ? "Enviar sussurro..."
                : "Enviar mensagem..."
            }
            className="h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 text-xs font-semibold text-white outline-none placeholder:text-white/35 focus:border-forge-gold"
          />

          <button
            type="submit"
            className="rounded-lg border border-forge-gold bg-forge-purple px-4 text-xs font-black text-forge-gold transition hover:bg-[#4d0d63]"
          >
            Enviar
          </button>
        </div>
      </form>
    </>
  );
}
