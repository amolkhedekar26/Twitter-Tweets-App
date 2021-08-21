const BASE_URL = 'http://localhost:3000/tweets';

/**
 * Retrive Twitter Data from API
 */

let nextPageUrl = null;

const getTwitterData = (url, nextPage = false) => {
  if (nextPage && nextPageUrl) {
    url = nextPageUrl;
  }
  fetch(url, {})
    .then((response) => response.json())
    .then((data) => {
      buildTweets(data.statuses, nextPage);
      saveNextPage(data.search_metadata);
      nextPageButtonVisibility(data.search_metadata);
    })
    .catch((error) => {
      console.log(error);
    });
};

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
  if (metadata.next_results) {
    nextPageUrl = `${BASE_URL}${metadata.next_results}`;
  } else {
    nextPageUrl = null;
  }
};

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {
  const query = e.target.innerText;
  userSearchInput.value = query;
  const encodedQuery = encodeURIComponent(query);
  const url = `http://localhost:3000/tweets?q=${encodedQuery}&count=10`;
  getTwitterData(url);
};

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
  if (metadata.next_results) {
    nextPageButton.style.visibility = 'visible';
  } else {
    nextPageButton.style.visibility = 'hidden';
  }
};

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
  let twitterContent = '';
  tweets.forEach((tweet) => {
    const createdDate = moment(tweet.created_at).fromNow();
    twitterContent += `
    <div class="tweet__container">
      <div class="tweet-user-info">
        <div class="tweet-user-profile" 
        style="background-image:url(${tweet.user.profile_image_url_https})"></div>
        <div class="tweet-user-name-container">
          <div class="tweet-user-fullname">
            ${tweet.user.name}
          </div>
          <!-- <div class="thunder-separator">⚡</div> -->
          <div class="tweet-user-username">
            @${tweet.user.screen_name}
          </div>
        </div>
      </div>`;
    if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
      twitterContent += buildImages(tweet.extended_entities.media);
      twitterContent += buildVideo(tweet.extended_entities.media);
    }

    twitterContent += `
    <div class="tweet-text-container">
        ${tweet.full_text}
      </div>
      <div class="tweet-date-container">${createdDate}</div>
    </div>
    `;
  });
  if (nextPage) {
    tweetsList.insertAdjacentHTML('beforeend', twitterContent);
  } else {
    tweetsList.innerHTML = twitterContent;
  }
};

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
  let imagesContent = `<div class="tweet-images-container">`;
  let imagesExist = false;
  mediaList.map((media) => {
    if (media.type == 'photo') {
      imagesExist = true;
      imagesContent += `
                <div class="tweet-image" style="background-image: url(${media.media_url_https})">
                </div>
            `;
    }
  });
  imagesContent += `</div>`;
  return imagesExist ? imagesContent : '';
};

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
  let videoContent = `<div class="tweet-video-container">`;
  let videoExist = false;
  mediaList.map((media) => {
    if (media.type == 'video') {
      videoExist = true;
      videoContent += `
                <video controls>
                    <source src="${media.video_info.variants[0].url}" type="video/mp4">
                </video>
            `;
    } else if (media.type == 'animated_gif') {
      videoExist = true;
      videoContent += `
                <video loop autoplay>
                    <source src="${media.video_info.variants[0].url}" type="video/mp4">
                </video>
            `;
    }
  });
  videoContent += `</div>`;
  return videoExist ? videoContent : '';
};

const OnNextPage = () => {
  if (nextPageUrl) {
    getTwitterData(nextPageUrl, true);
  }
};

const getVideOptions = (type) => {};
window.onload = () => {
  getTwitterData('http://localhost:3000/tweets?q=recent&count=10');
};

const tweetsList = document.getElementById('tweets-list');
const searchContainer = document.querySelector('.search__container');
const searchForm = document.getElementById('search-form');
const searchBtn = document.getElementById('search-btn');
const userSearchInput = document.getElementById('user-search-input');
const trendsList = document.querySelectorAll('.trend');
const nextPageButton = document.getElementById('next-page-btn');
const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

userSearchInput.addEventListener('focusin', (e) => {
  searchContainer.classList.add('search__container--active');
});

userSearchInput.addEventListener('focusout', (e) => {
  searchContainer.classList.remove('search__container--active');
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = userSearchInput.value;
  if (!query) {
    return;
  }
  const encodedQuery = encodeURIComponent(query);
  const URL = `http://localhost:3000/tweets?q=${encodedQuery}&count=10`;
  getTwitterData(URL);
});

searchBtn.addEventListener('click', (e) => {
  const query = userSearchInput.value;
  if (!query) {
    return;
  }
  const encodedQuery = encodeURIComponent(query);
  const URL = `http://localhost:3000/tweets?q=${encodedQuery}&count=10`;
  getTwitterData(URL);
});

trendsList.forEach((trend) => {
  trend.addEventListener('click', (e) => {
    selectTrend(e);
  });
});

nextPageButton.addEventListener('click', (e) => {
  OnNextPage();
});

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

scrollToTopBtn.addEventListener('click', (e) => {
  scrollToTop();
});
