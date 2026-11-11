import type { Metadata } from 'next';
import SafeSpace from '@/components/SafeSpace';

export const metadata: Metadata = {
  title: 'Safe Space — BastaEmmani',
};

export default function SafeSpacePage() {
  return <SafeSpace />;
}
