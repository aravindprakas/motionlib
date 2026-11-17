import { FeaturedGrid } from './FeaturedGrid';
import { sampleSpecimens } from '@/lib/sample-data';

export default function FeaturedGridDemo() {
  return <FeaturedGrid items={sampleSpecimens} />;
}
