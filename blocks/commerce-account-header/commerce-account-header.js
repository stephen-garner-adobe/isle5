import { Header, provider as UI } from '@dropins/tools/components.js';
import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const {
    title = 'My account',
  } = readBlockConfig(block);

  block.replaceChildren();

  return UI.render(Header, { title })(block);
}
