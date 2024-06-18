import * as Carousel from './Carousel.js';
import axios from 'axios';

const body = document.body;
// The breed selection input element.
const breedSelect = document.getElementById('breedSelect');
// The information section div element.
const infoDump = document.getElementById('infoDump');
// The progress bar div element.
const progressBar = document.getElementById('progressBar');
// The get favourites button element.
const getFavouritesBtn = document.getElementById('getFavouritesBtn');

const API_KEY = process.env.API_KEY;

axios.defaults.baseURL = 'https://api.thecatapi.com/v1';

axios.defaults.headers.common['x-api-key'] = API_KEY;

axios.interceptors.request.use((request) => {
  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();
  progressBar.style.width = '0%';
  body.style.cursor = 'progress';
  return request;
});

axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date().getTime();
    response.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;
    body.style.cursor = 'default';
    return response;
  },

  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;
    throw error;
  }
);

function updateProgress(progressEvent) {
  const percentage = Math.round(
    (progressEvent.loaded / progressEvent.total) * 100
  );
  progressBar.style.width = `${percentage}%`;
}

async function initialLoad() {
  try {
    const { data, durationInMS } = await axios.get('/breeds', {
      onDownloadProgress: updateProgress,
    });
    if (!data) {
      throw new Error('No data was returned from the API');
    }
    console.log(`Initial load request duration: ${durationInMS}ms`);
    data.forEach((breed) => {
      const option = document.createElement('option');
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }

  getBreedInfo();
}

document.addEventListener('DOMContentLoaded', initialLoad);

async function getBreedInfo() {
  try {
    const breedId = breedSelect.value;
    const { data, durationInMS } = await axios.get('/images/search', {
      params: {
        limit: 10,
        breed_ids: breedId,
      },
    });
    if (!data) {
      throw new Error('No data was returned from the API');
    }
    console.log(`Get breed info request duration: ${durationInMS}ms`);
    Carousel.clear();
    data.forEach((breed) => {
      const carouselItem = Carousel.createCarouselItem(
        breed.url,
        breed.breeds[0].name,
        breed.id
      );
      Carousel.appendCarousel(carouselItem);
      infoDump.innerHTML = `
      <h2>${breed.breeds[0].name}</h2>
      <p>${breed.breeds[0].description}</p>
      <p>Origin: ${breed.breeds[0].origin}</p>
      <p>Life Span: ${breed.breeds[0].life_span}</p>
      <p>Temperament: ${breed.breeds[0].temperament}</p>
    `;
    });
  } catch (error) {
    console.error(error);
  }
}

breedSelect.addEventListener('change', getBreedInfo);

export async function favourite(imgId) {
  // your code here
}
