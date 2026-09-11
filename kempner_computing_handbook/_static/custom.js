/* 
  This file adds two custom buttons to the top right of each page:
  1) Open Source Hub button - click to go to Open Source Hub section,
  2) Data Repository button - click to go to external Metadata site

  It also adds a "Star us on GitHub" line to the GitHub dropdown.
*/

const OPEN_SOURCE_URL = 'https://handbook.eng.kempnerinstitute.harvard.edu/s7_open_source_hub/README.html'
const DATA_REPOSITORY_URL = 'https://data.eng.kempnerinstitute.harvard.edu/signin'
const REPOSITORY_URL = 'https://github.com/KempnerInstitute/kempner-computing-handbook'

/*
  Creates button with tooltip and event listener for click.

  @param button_type                String    'open_source_hub' or 'data_repository'
  @param url                        String    destination HTML address for click event
  @param neighbor_button_identifier String    unique class name of the button to the right, for positioning
*/
function addCustomButton(button_type, url, neighbor_button_identifier) {

  const button = document.createElement('button');
  const icon = document.createElement('i');
  button.appendChild(icon);

  if (button_type == 'open_source_hub'){
      icon.classList.add('fa-solid', 'fa-database');  
      button.setAttribute('title', 'Open Source Hub');  // tooltip text
      button.classList.add('open-source-hub-button');
  } 
  
  if (button_type == 'data_repository'){
    icon.classList.add('fa-solid', 'fa-table-list');  
    button.setAttribute('title', 'Data Repository');  // tooltip text
  }

  button.classList.add('bd-header-article', 'article-header-buttons', 'header-article-items__end', 
    'header-article-item', 'btn', 'btn-sm', 'pst-navbar-icon', 'header-article-items', 
    'header-article__inner');
  button.setAttribute('data-bs-toggle', 'tooltip');
  button.setAttribute('data-bs-placement', 'bottom');  // tooltip position 


  const headerButtons = document.querySelector('.article-header-buttons');
  if (headerButtons) {

    // position new button to right of param 'neighbor' button
    const neighborButton = document.querySelector(neighbor_button_identifier);
    const parentElement = neighborButton.parentElement;
    parentElement.insertBefore(button, neighborButton);

    headerButtons.style.alignItems = 'center'; 
    
    button.addEventListener('click', function (event) {   
      event.preventDefault(); // prevent button from disappearing after click
      window.location.href = url
    }); 

    new bootstrap.Tooltip(button);
  }
}

/*
  Adds a "Star us on GitHub" line to the GitHub dropdown, below 'Repository' and
  above 'Open issue'.

  GitHub has no URL that stars a repository, so the link opens the repository
  page, where the reader can click Star themselves.
*/
function addStarMenuItem() {

  const menu = document.querySelector('.dropdown-source-buttons .dropdown-menu');
  if (!menu) {
    return;
  }

  const link = document.createElement('a');
  link.setAttribute('href', REPOSITORY_URL);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener');
  link.setAttribute('title', 'Star us on GitHub');  // tooltip text
  link.classList.add('btn', 'btn-sm', 'dropdown-item', 'star-repository-button');

  // The theme gives span.btn__icon-container a fixed width, which is what keeps
  // the icons in this menu aligned in a column, so use the same two spans as
  // the menu items the theme builds itself.
  const iconContainer = document.createElement('span');
  iconContainer.classList.add('btn__icon-container');
  const icon = document.createElement('i');
  icon.classList.add('fas', 'fa-star');
  iconContainer.appendChild(icon);

  const textContainer = document.createElement('span');
  textContainer.classList.add('btn__text-container');
  textContainer.textContent = 'Star us on GitHub';

  link.appendChild(iconContainer);
  link.appendChild(textContainer);

  const item = document.createElement('li');
  item.appendChild(link);

  // Second in the list: below 'Repository', above 'Open issue'.
  const firstItem = menu.firstElementChild;
  if (firstItem && firstItem.nextElementSibling) {
    menu.insertBefore(item, firstItem.nextElementSibling);
  } else {
    menu.appendChild(item);
  }
}

window.addEventListener('load', function() {
  addCustomButton('open_source_hub', OPEN_SOURCE_URL, '.dropdown-source-buttons'); 
  addCustomButton('data_repository', DATA_REPOSITORY_URL, '.open-source-hub-button');
  addStarMenuItem();
});