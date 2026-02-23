import { PageScaffold } from '@/pages/_shared/PageScaffold';
import { pageConfigs, type PageConfigKey } from '@/pages/_shared/pageConfigs';

export function createPage(key: PageConfigKey): () => JSX.Element {
  const Page = (): JSX.Element => <PageScaffold config={pageConfigs[key]} />;
  Page.displayName = `${String(key)}Page`;
  return Page;
}
