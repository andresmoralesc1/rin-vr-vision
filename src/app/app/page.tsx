'use client';
import dynamic from 'next/dynamic';
import { CameraStage } from '@/components/ar/CameraStage';
import { useCamera } from '@/lib/camera/useCamera';

const RimViewer = dynamic(() => import('@/components/ar/RimViewer').then(m => m.RimViewer), { ssr: false });

export default function AppPage() {
  const { status } = useCamera();
  return (
    <CameraStage>
      {status === 'granted' && <RimViewer />}
    </CameraStage>
  );
}
