
import React from 'react';
import { TAG_COLORS } from '../constants';

interface ColorPaletteProps {
  selectedColor: string;
  onSelectColor: (colorClasses: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_COLORS.map(({ name, classes }) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelectColor(classes)}
          className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${classes.split(' ')[0]} ${selectedColor === classes ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-transparent'}`}
          aria-label={`Selecionar cor ${name}`}
        />
      ))}
    </div>
  );
};

export default ColorPalette;
