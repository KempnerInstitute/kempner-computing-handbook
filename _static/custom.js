/* 
  This file adds two custom buttons to the top right of each page:
  1) Open Source Hub button - click to go to Open Source Hub section,
  2) Data Repository button - click to go to external Metadata site
*/

const OPEN_SOURCE_URL = 'https://handbook.eng.kempnerinstitute.harvard.edu/s7_open_source_hub/README.html'
const DATA_REPOSITORY_URL = 'https://data.eng.kempnerinstitute.harvard.edu/signin'

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

window.addEventListener('load', function() {
  addCustomButton('open_source_hub', OPEN_SOURCE_URL, '.dropdown-source-buttons'); 
  addCustomButton('data_repository', DATA_REPOSITORY_URL, '.open-source-hub-button');
});