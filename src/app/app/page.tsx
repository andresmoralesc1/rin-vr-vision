import { CameraStage } from '@/components/ar/CameraStage';
import dynamic from 'next/dynamic';

const RimViewer = dynamic(() => import('@/components/ar/RimViewer').then(m => m.RimViewer), { ssr: false });

export default function AppPage() {
  return (
    <>
      <CameraStage />
      {false && <RimViewer />} {/* mounted in Task 11 */}
    </>
  );
}