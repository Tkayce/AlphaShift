import React, { useRef } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { s } from 'react-native-wind';
import { Tile } from '../hooks/useSpellingEngine';

interface AlphaGridProps {
  grid: Tile[][];
  selectedIndices: { row: number; col: number }[];
  isCorrect: boolean | null;
  hintPath: { row: number; col: number }[];
  targetWord: string;
  onTouchStart: (row: number, col: number) => void;
  onTouchMove: (row: number, col: number) => void;
  onTouchEnd: () => void;
}

const { width } = Dimensions.get('window');
const GRID_SIZE = 5;
const PADDING = 24;
const GRID_WIDTH = width - PADDING * 2;
const TILE_SIZE = 56;
const TILE_MARGIN = 8;
const ACTUAL_CELL_SIZE = TILE_SIZE + TILE_MARGIN;

export const AlphaGrid: React.FC<AlphaGridProps> = ({
  grid,
  selectedIndices,
  isCorrect,
  hintPath,
  targetWord,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const layoutRef = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const lastTouchedRow = useSharedValue(-1);
  const lastTouchedCol = useSharedValue(-1);
  const endedThisGesture = useSharedValue(false);

  const handleTouch = (x: number, y: number, isMove: boolean) => {
    'worklet';
    if (!layoutRef.current.width) return;

    // Use relative coordinates from the gesture if possible, 
    // but Gesture events provide absolute or relative to the component.
    // In GH v2, x and y are relative to the view the gesture is attached to.
    
    // Increase the "hit area" of each tile slightly for smoother dragging
    // ACTUAL_CELL_SIZE is 64 (56 size + 8 margin)
    // We can use a small buffer to make it easier to trigger the tile
    const paddingOffset = 4;
    const hitBuffer = 12;
    const col = Math.floor((x - paddingOffset + hitBuffer) / ACTUAL_CELL_SIZE);
    const row = Math.floor((y - paddingOffset + hitBuffer) / ACTUAL_CELL_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      if (isMove && row === lastTouchedRow.value && col === lastTouchedCol.value) return;
      lastTouchedRow.value = row;
      lastTouchedCol.value = col;
      if (isMove) {
        runOnJS(onTouchMove)(row, col);
      } else {
        runOnJS(onTouchStart)(row, col);
      }
    }
  };

  const gesture = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .onStart((e) => {
      endedThisGesture.value = false;
      lastTouchedRow.value = -1;
      lastTouchedCol.value = -1;
      handleTouch(e.x, e.y, false);
    })
    .onUpdate((e) => {
      handleTouch(e.x, e.y, true);
    })
    .onFinalize(() => {
      if (endedThisGesture.value) return;
      endedThisGesture.value = true;
      runOnJS(onTouchEnd)();
      lastTouchedRow.value = -1;
      lastTouchedCol.value = -1;
    });

  const renderLines = (path: { row: number; col: number }[], color: string, opacity: number, strokeWidth: string) => {
    return path.map((curr, idx) => {
      if (idx === 0) return null;
      const prev = path[idx - 1];
      const x1 = prev.col * ACTUAL_CELL_SIZE + TILE_SIZE / 2 + TILE_MARGIN / 2 + 4;
      const y1 = prev.row * ACTUAL_CELL_SIZE + TILE_SIZE / 2 + TILE_MARGIN / 2 + 4;
      const x2 = curr.col * ACTUAL_CELL_SIZE + TILE_SIZE / 2 + TILE_MARGIN / 2 + 4;
      const y2 = curr.row * ACTUAL_CELL_SIZE + TILE_SIZE / 2 + TILE_MARGIN / 2 + 4;

      return (
        <Line
          key={`line-${idx}`}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={opacity}
        />
      );
    });
  };

  return (
    <GestureDetector gesture={gesture}>
      <View
        onLayout={(e) => {
          // GH v2 events are relative to the component, so we just need to know if we have layout
          const { width, height } = e.nativeEvent.layout;
          layoutRef.current = { x: 0, y: 0, width, height };
        }}
        style={s`w-full aspect-square bg-slate-900 rounded-3xl p-1 justify-center items-center relative overflow-hidden`}
      >
        <View style={[s`absolute inset-0`, { zIndex: 10 }]} pointerEvents="none">
          <Svg height="100%" width="100%">
            {/* Hint Lines */}
            {hintPath.length > 0 && renderLines(hintPath, "#eab308", 0.4, "12")}
            
            {/* User Tracing Lines */}
            {selectedIndices.length > 0 && renderLines(
              selectedIndices, 
              isCorrect === true ? "#22c55e" : isCorrect === false ? "#ef4444" : "#f97316",
              0.6,
              "8"
            )}
          </Svg>
        </View>

        <View style={s`z-20`} pointerEvents="none">
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={s`flex-row`}>
              {row.map((tile, colIndex) => {
                const isSelected = selectedIndices.some(idx => idx.row === rowIndex && idx.col === colIndex);
                const isInHint = hintPath.some(idx => idx.row === rowIndex && idx.col === colIndex);

                return (
                  <View 
                    key={tile.id} 
                    style={[
                      s`w-14 h-14 m-1 rounded-2xl items-center justify-center bg-slate-800 border-2 border-slate-700`,
                      isSelected && s`border-orange-500 bg-orange-600/20 scale-105`,
                      isSelected && isCorrect === true && s`border-green-500 bg-green-600/20`,
                      isSelected && isCorrect === false && s`border-red-500 bg-red-600/20`,
                      (!isSelected && isInHint) && s`border-yellow-400 bg-yellow-600/20`,
                    ]}
                  >
                    <Text
                      style={[
                        s`text-white font-bold text-2xl`,
                        isSelected && s`text-orange-500`,
                        isSelected && isCorrect === true && s`text-green-500`,
                        isSelected && isCorrect === false && s`text-red-500`,
                        (!isSelected && isInHint) && s`text-yellow-400`,
                      ]}
                    >
                      {tile.char}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </GestureDetector>
  );
};
