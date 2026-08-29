import type { PointerEvent, ReactNode } from "react";
import Image from "next/image";

import type { SceneToken } from "../types/game-table-types";

import {
  getCharacterTypeLabel,
  getCharacterTypeStyles,
} from "../utils/actor-utils";

import { getTokenImageFitClass } from "../utils/token-utils";

type ScenePoint = {
  x: number;
  y: number;
};

type MeasureMode = "line" | "circle";

type DrawStroke = {
  id: string;
  points: ScenePoint[];
};

type FogReveal = {
  id: string;
  start: ScenePoint;
  end: ScenePoint;
};

type TableSceneCanvasProps = {
  activeToolLabel: string;
  zoom: number;
  scenePan: ScenePoint;
  isLeftToolbarOpen: boolean;
  isRightPanelOpen: boolean;
  isPanToolActive: boolean;
  isPanningScene: boolean;
  isMeasureToolActive: boolean;
  measureMode: MeasureMode;
  measureStart: ScenePoint | null;
  measureEnd: ScenePoint | null;
  isDrawToolActive: boolean;
  drawStrokes: DrawStroke[];
  currentDrawStroke: DrawStroke | null;
  sceneTokens: SceneToken[];
  draggingTokenId: string | null;
  children?: ReactNode;
  canMoveToken: (token: SceneToken) => boolean;
  onShowLeftToolbar: () => void;
  onShowRightPanel: () => void;
  onStartTokenDrag: (
    tokenId: string,
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
  onMoveTokenOnScene: (event: PointerEvent<HTMLDivElement>) => void;
  onStopTokenDrag: () => void;
  onStartScenePan: (event: PointerEvent<HTMLDivElement>) => void;
  onMoveScenePan: (event: PointerEvent<HTMLDivElement>) => void;
  onStopScenePan: () => void;
  onStartMeasure: (event: PointerEvent<HTMLDivElement>) => void;
  onMoveMeasure: (event: PointerEvent<HTMLDivElement>) => void;
  onStopMeasure: () => void;
  onChangeMeasureMode: (mode: MeasureMode) => void;
  onStartDraw: (event: PointerEvent<HTMLDivElement>) => void;
  onMoveDraw: (event: PointerEvent<HTMLDivElement>) => void;
  onStopDraw: () => void;
  onUndoLastDrawing: () => void;
  onClearDrawings: () => void;
  isFogToolActive: boolean;
  fogReveals: FogReveal[];
  currentFogReveal: FogReveal | null;
  onStartFogReveal: (event: PointerEvent<HTMLDivElement>) => void;
  onMoveFogReveal: (event: PointerEvent<HTMLDivElement>) => void;
  onStopFogReveal: () => void;
  onUndoLastFogReveal: () => void;
  onClearFogReveals: () => void;
};

const SCENE_WIDTH = 1400;
const SCENE_HEIGHT = 900;
const GRID_SIZE_IN_PIXELS = 40;
const GRID_SIZE_IN_METERS = 1.5;

function getMeasureDistanceInPixels(start: ScenePoint, end: ScenePoint) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function getMeasureDistanceInMeters(distanceInPixels: number) {
  return (distanceInPixels / GRID_SIZE_IN_PIXELS) * GRID_SIZE_IN_METERS;
}

function formatMeters(value: number) {
  return `${value.toFixed(1).replace(".", ",")}m`;
}

function getMeasureAngleInRadians(start: ScenePoint, end: ScenePoint) {
  return Math.atan2(end.y - start.y, end.x - start.x);
}

function getFogRevealBounds(reveal: FogReveal) {
  const left = Math.min(reveal.start.x, reveal.end.x);
  const top = Math.min(reveal.start.y, reveal.end.y);
  const width = Math.abs(reveal.end.x - reveal.start.x);
  const height = Math.abs(reveal.end.y - reveal.start.y);

  return {
    left,
    top,
    width,
    height,
  };
}

function getStrokePoints(stroke: DrawStroke) {
  return stroke.points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function TableSceneCanvas({
  activeToolLabel,
  zoom,
  scenePan,
  isLeftToolbarOpen,
  isRightPanelOpen,
  isPanToolActive,
  isPanningScene,
  isMeasureToolActive,
  measureMode,
  measureStart,
  measureEnd,
  isDrawToolActive,
  drawStrokes,
  currentDrawStroke,
  sceneTokens,
  draggingTokenId,
  children,
  canMoveToken,
  onShowLeftToolbar,
  onShowRightPanel,
  onStartTokenDrag,
  onMoveTokenOnScene,
  onStopTokenDrag,
  onStartScenePan,
  onMoveScenePan,
  onStopScenePan,
  onStartMeasure,
  onMoveMeasure,
  onStopMeasure,
  onChangeMeasureMode,
  onStartDraw,
  onMoveDraw,
  onStopDraw,
  onUndoLastDrawing,
  onClearDrawings,
  isFogToolActive,
  fogReveals,
  currentFogReveal,
  onStartFogReveal,
  onMoveFogReveal,
  onStopFogReveal,
  onUndoLastFogReveal,
  onClearFogReveals,
}: TableSceneCanvasProps) {
  const measureDistance =
    measureStart && measureEnd
      ? getMeasureDistanceInPixels(measureStart, measureEnd)
      : 0;

  const measureDistanceInMeters = getMeasureDistanceInMeters(measureDistance);
  const visibleDrawStrokes = currentDrawStroke
    ? [...drawStrokes, currentDrawStroke]
    : drawStrokes;

  return (
    <section className="relative min-h-0 overflow-hidden bg-[#24142a]">
      <div className="absolute left-5 top-5 z-10 rounded-xl border border-forge-gold/35 bg-black/50 px-4 py-3 shadow-[-6px_6px_0_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          Ferramenta ativa
        </p>

        <p className="mt-1 text-xs font-black text-forge-gold">
          {activeToolLabel}
        </p>
      </div>

      {isMeasureToolActive ? (
        <div className="absolute left-5 top-24 z-10 flex overflow-hidden rounded-xl border border-forge-gold/35 bg-black/65 shadow-[-5px_5px_0_rgba(0,0,0,0.35)] backdrop-blur">
          <button
            type="button"
            onClick={() => onChangeMeasureMode("line")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
              measureMode === "line"
                ? "bg-forge-purple text-forge-gold"
                : "text-white/55 hover:text-forge-gold"
            }`}
          >
            Linha
          </button>

          <button
            type="button"
            onClick={() => onChangeMeasureMode("circle")}
            className={`border-l border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${
              measureMode === "circle"
                ? "bg-forge-purple text-forge-gold"
                : "text-white/55 hover:text-forge-gold"
            }`}
          >
            Círculo
          </button>
        </div>
      ) : null}

      {isDrawToolActive ? (
        <div className="absolute left-5 top-24 z-10 flex overflow-hidden rounded-xl border border-red-400/40 bg-black/65 shadow-[-5px_5px_0_rgba(0,0,0,0.35)] backdrop-blur">
          <button
            type="button"
            onClick={onUndoLastDrawing}
            className="border-r border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-forge-gold transition hover:bg-forge-purple"
          >
            Desfazer
          </button>

          <button
            type="button"
            onClick={onClearDrawings}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/20"
          >
            Limpar
          </button>
        </div>
      ) : null}

      {isFogToolActive ? (
        <div className="absolute left-5 top-24 z-10 flex overflow-hidden rounded-xl border border-slate-300/30 bg-black/70 shadow-[-5px_5px_0_rgba(0,0,0,0.35)] backdrop-blur">
          <button
            type="button"
            onClick={onUndoLastFogReveal}
            className="border-r border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-forge-gold transition hover:bg-forge-purple"
          >
            Desfazer
          </button>

          <button
            type="button"
            onClick={onClearFogReveals}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-500/20"
          >
            Limpar névoa
          </button>
        </div>
      ) : null}

      {!isLeftToolbarOpen ? (
        <button
          type="button"
          onClick={onShowLeftToolbar}
          title="Mostrar ferramentas"
          className="absolute left-3 top-1/2 z-20 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-forge-gold/40 bg-black/55 text-lg font-black text-forge-gold shadow-[-6px_6px_0_rgba(0,0,0,0.35)] transition hover:bg-forge-purple"
          aria-label="Mostrar ferramentas"
        >
          ›
        </button>
      ) : null}

      {!isRightPanelOpen ? (
        <button
          type="button"
          onClick={onShowRightPanel}
          title="Mostrar painel"
          className="absolute right-3 top-1/2 z-20 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-forge-gold/40 bg-black/55 text-lg font-black text-forge-gold shadow-[-6px_6px_0_rgba(0,0,0,0.35)] transition hover:bg-forge-purple"
          aria-label="Mostrar painel"
        >
          ‹
        </button>
      ) : null}

      <div
        className={`absolute inset-0 flex items-center justify-center p-10 ${
          isPanToolActive
            ? isPanningScene
              ? "cursor-grabbing"
              : "cursor-grab"
            : isMeasureToolActive || isDrawToolActive || isFogToolActive
              ? "cursor-crosshair"
              : ""
        }`}
        onPointerDown={onStartScenePan}
        onPointerMove={onMoveScenePan}
        onPointerUp={onStopScenePan}
        onPointerLeave={onStopScenePan}
      >
        <div
          className="relative h-[900px] w-[1400px] origin-center overflow-hidden rounded-2xl border border-forge-gold/35 bg-[#e4d0a3] shadow-[-18px_18px_5px_rgba(0,0,0,0.35)] transition-transform"
          style={{
            transform: `translate(${scenePan.x}px, ${scenePan.y}px) scale(${
              zoom / 100
            })`,
          }}
          onPointerDown={(event) => {
            onStartMeasure(event);
            onStartDraw(event);
            onStartFogReveal(event);
          }}
          onPointerMove={(event) => {
            onMoveTokenOnScene(event);
            onMoveMeasure(event);
            onMoveDraw(event);
            onMoveFogReveal(event);
          }}
          onPointerUp={() => {
            onStopTokenDrag();
            onStopMeasure();
            onStopDraw();
            onStopFogReveal();
          }}
          onPointerLeave={() => {
            onStopTokenDrag();
            onStopMeasure();
            onStopDraw();
            onStopFogReveal();
          }}
        >
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(64,32,75,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(64,32,75,0.18)_1px,transparent_1px)] [background-size:40px_40px]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,214,102,0.22),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(64,0,80,0.18),transparent_32%)]" />

          {children}

          <svg className="pointer-events-none absolute inset-0 z-50 h-full w-full">
            {visibleDrawStrokes.map((stroke) => (
              <polyline
                key={stroke.id}
                points={getStrokePoints(stroke)}
                fill="none"
                stroke="rgba(234, 179, 8, 0.95)"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>

          {measureStart && measureEnd ? (
            <div className="pointer-events-none absolute inset-0 z-50">
              {measureMode === "circle" ? (
                <>
                  <div
                    className="absolute rounded-full border-4 border-forge-gold/90 bg-forge-gold/10 shadow-[-4px_4px_12px_rgba(0,0,0,0.45)]"
                    style={{
                      left: measureStart.x - measureDistance,
                      top: measureStart.y - measureDistance,
                      width: measureDistance * 2,
                      height: measureDistance * 2,
                    }}
                  />

                  <div
                    className="absolute h-[5px] origin-left rounded-full bg-forge-gold shadow-[-3px_3px_10px_rgba(0,0,0,0.55)]"
                    style={{
                      left: measureStart.x,
                      top: measureStart.y,
                      width: measureDistance,
                      transform: `rotate(${getMeasureAngleInRadians(
                        measureStart,
                        measureEnd,
                      )}rad)`,
                    }}
                  />

                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-forge-gold shadow-[-3px_3px_8px_rgba(0,0,0,0.45)]"
                    style={{
                      left: measureStart.x,
                      top: measureStart.y,
                    }}
                  />

                  <div
                    className="absolute rounded-lg border border-forge-gold/60 bg-black/80 px-3 py-2 text-xs font-black text-forge-gold shadow-[-4px_4px_0_rgba(0,0,0,0.35)]"
                    style={{
                      left: measureEnd.x + 10,
                      top: measureEnd.y + 10,
                    }}
                  >
                    {`${formatMeters(measureDistanceInMeters)} raio / ${formatMeters(
                      measureDistanceInMeters * 2,
                    )} diâmetro`}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="absolute h-[5px] origin-left rounded-full bg-forge-gold shadow-[-3px_3px_10px_rgba(0,0,0,0.55)]"
                    style={{
                      left: measureStart.x,
                      top: measureStart.y,
                      width: measureDistance,
                      transform: `rotate(${getMeasureAngleInRadians(
                        measureStart,
                        measureEnd,
                      )}rad)`,
                    }}
                  />

                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-forge-gold shadow-[-3px_3px_8px_rgba(0,0,0,0.45)]"
                    style={{
                      left: measureStart.x,
                      top: measureStart.y,
                    }}
                  />

                  <div
                    className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-forge-gold shadow-[-3px_3px_8px_rgba(0,0,0,0.45)]"
                    style={{
                      left: measureEnd.x,
                      top: measureEnd.y,
                    }}
                  />

                  <div
                    className="absolute rounded-lg border border-forge-gold/60 bg-black/80 px-3 py-2 text-xs font-black text-forge-gold shadow-[-4px_4px_0_rgba(0,0,0,0.35)]"
                    style={{
                      left: measureEnd.x + 10,
                      top: measureEnd.y + 10,
                    }}
                  >
                    {formatMeters(measureDistanceInMeters)}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {sceneTokens.map((token) => (
            <div
              key={token.id}
              className="absolute"
              style={{
                left: token.x,
                top: token.y,
              }}
            >
              <button
                type="button"
                title={`${token.name} — ${getCharacterTypeLabel(token.type)}`}
                onPointerDown={(event) => {
                  if (!canMoveToken(token)) {
                    return;
                  }

                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  onStartTokenDrag(token.id, event);
                }}
                className={`flex items-center justify-center overflow-hidden rounded-full border-2 text-xl font-black shadow-[-6px_6px_12px_rgba(0,0,0,0.42)] transition ${
                  draggingTokenId === token.id
                    ? "scale-105 shadow-[-10px_10px_18px_rgba(0,0,0,0.5)]"
                    : ""
                } ${
                  canMoveToken(token)
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default"
                } ${getCharacterTypeStyles(token.type)}`}
                style={{
                  width: token.width,
                  height: token.height,
                }}
              >
                {token.imageUrl ? (
                  <Image
                    src={token.imageUrl}
                    alt={token.name}
                    width={token.width}
                    height={token.height}
                    className={`h-full w-full ${getTokenImageFitClass(
                      token.imageFit,
                    )}`}
                    draggable={false}
                    unoptimized
                  />
                ) : (
                  token.initials
                )}
              </button>
            </div>
          ))}

          {isFogToolActive || fogReveals.length > 0 || currentFogReveal ? (
            <svg
              className="pointer-events-none absolute inset-0 z-40 h-full w-full"
              viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
              aria-hidden="true"
            >
              <defs>
                <mask id="legendforge-fog-mask">
                  <rect
                    x="0"
                    y="0"
                    width={SCENE_WIDTH}
                    height={SCENE_HEIGHT}
                    fill="white"
                  />

                  {[
                    ...fogReveals,
                    ...(currentFogReveal ? [currentFogReveal] : []),
                  ].map((reveal) => {
                    const bounds = getFogRevealBounds(reveal);

                    return (
                      <rect
                        key={reveal.id}
                        x={bounds.left}
                        y={bounds.top}
                        width={bounds.width}
                        height={bounds.height}
                        rx="14"
                        ry="14"
                        fill="black"
                      />
                    );
                  })}
                </mask>
              </defs>

              <rect
                x="0"
                y="0"
                width={SCENE_WIDTH}
                height={SCENE_HEIGHT}
                fill="rgba(0, 0, 0, 0.72)"
                mask="url(#legendforge-fog-mask)"
              />

              {currentFogReveal ? (
                <rect
                  x={getFogRevealBounds(currentFogReveal).left}
                  y={getFogRevealBounds(currentFogReveal).top}
                  width={getFogRevealBounds(currentFogReveal).width}
                  height={getFogRevealBounds(currentFogReveal).height}
                  rx="14"
                  ry="14"
                  fill="none"
                  stroke="rgba(234, 179, 8, 0.9)"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                />
              ) : null}
            </svg>
          ) : null}

          <div className="absolute bottom-5 right-5 rounded-lg border border-black/20 bg-black/30 px-3 py-2 text-xs font-bold text-white/80">
            Grid inicial da cena
          </div>
        </div>
      </div>
    </section>
  );
}
