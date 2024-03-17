'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.pace();
  }

  pace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.speed();
  }

  speed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([30, -55], 5, 30, 4000);
// const cyclng1 = new Cycling([30, -55], 20, 60, 500);
// console.log(run1);
// console.log(cyclng1);

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    inputType.addEventListener('change', this._toggleElevationField);
    form.addEventListener('submit', this._newWorkOut.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('error getting location');
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkOut(e) {
    //Check if data is valid
    const validateInput = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const validatePositiveInput = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //Get data from form
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const type = inputType.value;

    //if workout is running , create running object
    if (type === 'running') {
      const cadence = Number(inputCadence.value);
      //
      if (
        !validateInput(distance, duration, cadence) ||
        !validatePositiveInput(distance, duration, cadence)
      )
        return alert('Input value should be positive');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if workout is cycling , create cycling object
    if (type === 'cycling') {
      const elevation = Number(inputElevation.value);
      if (
        !validateInput(distance, duration, elevation) ||
        !validatePositiveInput(distance, duration)
      ) {
        return alert('Input value should be positive');
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //add new object to workout array;
    this.#workouts.push(workout);
    // console.log(this.#workouts);

    //Render workout on map as marker

    //Render workout on list
    this.renderWorkoutMarker(workout);
    //clear input fields
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}
const app = new App();
