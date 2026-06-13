import React from 'react';
import {
  Baby,
  ShieldAlert,
  Wind,
  Moon,
  AlertCircle,
  Thermometer,
  Heart,
  Volume2,
  VolumeX,
  Smile,
  Activity
} from 'lucide-react';
import { CryLabel } from '../types';

interface CryIconProps {
  label: CryLabel;
  className?: string;
  size?: number | string;
}

export default function CryIcon({ label, className = '', size = 20 }: CryIconProps) {
  let iconColor = 'text-[#5C8A6B]';
  let iconComponent = Baby;

  switch (label) {
    case CryLabel.HUNGRY:
      iconComponent = Baby;
      iconColor = 'text-[#D4833A]';
      break;
    case CryLabel.BELLY_PAIN:
      iconComponent = Activity;
      iconColor = 'text-orange-500';
      break;
    case CryLabel.BURPING:
      iconComponent = Wind;
      iconColor = 'text-teal-500';
      break;
    case CryLabel.TIRED:
      iconComponent = Moon;
      iconColor = 'text-violet-500';
      break;
    case CryLabel.DISCOMFORT:
      iconComponent = AlertCircle;
      iconColor = 'text-rose-500';
      break;
    case CryLabel.COLD_HOT:
      iconComponent = Thermometer;
      iconColor = 'text-sky-500';
      break;
    case CryLabel.LONELY:
      iconComponent = Heart;
      iconColor = 'text-pink-400';
      break;
    case CryLabel.SCARED:
      iconComponent = ShieldAlert;
      iconColor = 'text-red-500';
      break;
    case CryLabel.NOISE:
      iconComponent = Volume2;
      iconColor = 'text-amber-500';
      break;
    case CryLabel.SILENCE:
      iconComponent = VolumeX;
      iconColor = 'text-emerald-600';
      break;
    case CryLabel.LAUGH:
      iconComponent = Smile;
      iconColor = 'text-amber-400';
      break;
  }

  const Component = iconComponent;
  return <Component size={size} className={`${iconColor} ${className}`} />;
}
