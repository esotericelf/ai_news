import Breadcrumbs from '../components/ui/Breadcrumbs';
import MasterReportView from '../features/report/MasterReportView';
import SeoHead from '../seo/SeoHead';
import { config } from '../config';

export default function MasterReportPage() {
  return (
    <>
      <SeoHead
        title="Master Report — AI & Tech Data Analysis"
        description="Programmatic aggregate statistics, monthly velocity, sector coverage, and automated insights on artificial intelligence and technical innovation."
        canonical={`${config.siteUrl}/report`}
        keywords={[
          'AI industry report',
          'artificial intelligence statistics',
          'machine learning trends',
          'tech innovation data',
          'programmatic analysis',
        ]}
      />

      <div className="page page--report">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Master Report' }]} />
        <MasterReportView />
      </div>
    </>
  );
}
