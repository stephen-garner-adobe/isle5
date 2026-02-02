/**
 * Parse block configuration from DA.live
 * @param {Element} block - The block element from DA.live
 * @returns {Object} Parsed configuration object with alignment settings
 */
function parseBlockConfig(block) {
  // Configuration could come from data attributes or metadata
  const alignment = block.dataset.alignment || 'center';

  // Validate alignment value
  const validAlignments = ['left', 'center', 'right'];

  return {
    alignment: validAlignments.includes(alignment) ? alignment : 'center',
  };
}

/**
 * Decorates the three-boxes block
 * @param {Element} block - The three-boxes block element
 */
export default function decorate(block) {
  // Parse configuration from DA.live
  const config = parseBlockConfig(block);

  // Create container for three boxes
  const container = document.createElement('div');
  container.classList.add('three-boxes-container');

  // Apply alignment configuration via data attribute
  container.setAttribute('data-alignment', config.alignment);

  // Get all rows from the block
  const boxes = [...block.children];

  // Limit to 3 boxes
  boxes.slice(0, 3).forEach((box, index) => {
    const boxElement = document.createElement('div');
    boxElement.classList.add('three-boxes-box');
    boxElement.classList.add(`three-boxes-box-${index + 1}`);

    // Get the three columns: icon, title, description
    const columns = [...box.children];

    // Add icon
    if (columns[0]) {
      const iconDiv = document.createElement('div');
      iconDiv.classList.add('three-boxes-icon');
      while (columns[0].firstElementChild) {
        iconDiv.append(columns[0].firstElementChild);
      }
      boxElement.append(iconDiv);
    }

    // Create content wrapper for title and description
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('three-boxes-content');

    if (columns[1]) {
      const titleDiv = document.createElement('div');
      titleDiv.classList.add('three-boxes-title');
      while (columns[1].firstElementChild) {
        titleDiv.append(columns[1].firstElementChild);
      }
      contentDiv.append(titleDiv);
    }

    if (columns[2]) {
      const descDiv = document.createElement('div');
      descDiv.classList.add('three-boxes-description');
      while (columns[2].firstElementChild) {
        descDiv.append(columns[2].firstElementChild);
      }
      contentDiv.append(descDiv);
    }

    boxElement.append(contentDiv);
    container.append(boxElement);
  });

  // Replace block children with new structure
  block.replaceChildren(container);
}
