/*
  This file adds a "Was this page helpful?" widget to the bottom of each page,
  above the previous/next links. Clicking thumbs up or thumbs down reports a
  page_helpful_yes or page_helpful_no event to Google Analytics.

  Google Analytics attaches the page path to every event on its own, so the
  results break down per page under Reports > Engagement > Events without any
  custom dimensions needing to be registered in the Analytics console.
*/

const FEEDBACK_PROMPT = 'Was this page helpful?';
const FEEDBACK_THANKS = 'Thanks for your feedback!';
const FEEDBACK_STORAGE_PREFIX = 'kch-page-feedback:';

// Pages that are generated rather than written, where feedback is not meaningful.
const FEEDBACK_SKIP_PAGES = ['genindex.html', 'search.html'];

/*
  Reports a vote to Google Analytics.

  This is the only place the widget talks to an analytics backend. If the vote
  ever needs to go somewhere else instead, this function is the only one that
  has to change.

  @param helpful  Boolean  true for thumbs up, false for thumbs down
*/
function recordVote(helpful) {
  const eventName = helpful ? 'page_helpful_yes' : 'page_helpful_no';

  // gtag is defined inline by the Analytics snippet, but guard anyway so a
  // blocked or missing snippet cannot break the page.
  if (typeof gtag === 'function') {
    gtag('event', eventName);
  }
}

/*
  Reads whether this reader already voted on this page. Storage can throw in
  private browsing or when site data is blocked, in which case we simply treat
  the reader as not having voted yet.

  @param key  String  localStorage key for the current page
*/
function hasVoted(key) {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
}

/*
  Remembers the vote so the widget does not ask again on a revisit. A failure
  here is not worth surfacing: the vote already reached Analytics.

  @param key      String   localStorage key for the current page
  @param helpful  Boolean  true for thumbs up, false for thumbs down
*/
function rememberVote(key, helpful) {
  try {
    window.localStorage.setItem(key, helpful ? 'yes' : 'no');
  } catch (error) {
    /* storage unavailable */
  }
}

/*
  Builds one vote button.

  @param helpful  Boolean   true for thumbs up, false for thumbs down
  @param onVote   Function  called with `helpful` when the button is clicked
*/
function buildVoteButton(helpful, onVote) {
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('page-feedback__button');
  button.setAttribute(
    'aria-label',
    helpful ? 'Yes, this page was helpful' : 'No, this page was not helpful'
  );

  // Both icon styles are rendered and CSS shows one at a time: FontAwesome's
  // outline and solid thumbs are separate glyphs, so hovering cannot simply
  // fill the existing one.
  const iconName = helpful ? 'fa-thumbs-up' : 'fa-thumbs-down';
  [['fa-regular', 'outline'], ['fa-solid', 'filled']].forEach(function (style) {
    const icon = document.createElement('i');
    icon.classList.add(style[0], iconName, 'page-feedback__icon',
                       'page-feedback__icon--' + style[1]);
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);
  });
  button.appendChild(document.createTextNode(helpful ? 'Yes' : 'No'));

  button.addEventListener('click', function () {
    onVote(helpful);
  });

  return button;
}

/*
  Adds the feedback widget to the bottom of the article, if this is a page that
  should have one.
*/
function addFeedbackWidget() {
  const article = document.querySelector('article.bd-article');
  if (!article) {
    return;  // not a content page
  }

  // Match on the file name alone. Testing the whole path with endsWith would
  // also skip any page whose name merely ends with a skipped name, such as
  // agentic_ai_in_research.html, which ends with the string search.html.
  const page = window.location.pathname;
  const pageName = page.substring(page.lastIndexOf('/') + 1);
  const isSkipped = FEEDBACK_SKIP_PAGES.indexOf(pageName) !== -1;
  if (isSkipped) {
    return;
  }

  const storageKey = FEEDBACK_STORAGE_PREFIX + page;

  // 'd-print-none' is the theme's own utility class, used here so the widget is
  // left out of printed pages the same way the previous/next footer is.
  const widget = document.createElement('div');
  widget.classList.add('page-feedback', 'd-print-none');

  const prompt = document.createElement('span');
  prompt.classList.add('page-feedback__prompt');
  prompt.textContent = FEEDBACK_PROMPT;

  // Announce the thank-you to screen readers when it replaces the buttons.
  const response = document.createElement('div');
  response.classList.add('page-feedback__response');
  response.setAttribute('aria-live', 'polite');

  // Once a vote is in, the thank-you replaces the question rather than sitting
  // next to it.
  function showThanks() {
    prompt.remove();
    response.textContent = '';
    const thanks = document.createElement('span');
    thanks.classList.add('page-feedback__thanks');
    thanks.textContent = FEEDBACK_THANKS;
    response.appendChild(thanks);
  }

  function handleVote(helpful) {
    recordVote(helpful);
    rememberVote(storageKey, helpful);
    showThanks();
  }

  // Both children go in before showThanks can run, so that removing the prompt
  // works on the revisit path too.
  widget.appendChild(prompt);
  widget.appendChild(response);

  if (hasVoted(storageKey)) {
    showThanks();
  } else {
    response.appendChild(buildVoteButton(true, handleVote));
    response.appendChild(buildVoteButton(false, handleVote));
  }
  // Appended inside the article rather than after it, so the widget picks up
  // the theme's own content padding and lines up with the body text.
  article.appendChild(widget);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addFeedbackWidget);
} else {
  addFeedbackWidget();
}
