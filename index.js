const autoCompleteConfig = {
  renderOption(movie) {
    const imgsrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
    <img src = "${imgsrc}"/>
    ${movie.Title} (${movie.Year})
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "898f3943",
        s: searchTerm,
      },
    });
    if (response.data.Error) return [];
    return response.data.Search;
  },
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),

  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onSelect(movie, document.querySelector("#left-summary"), "left");
  },
});

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),

  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

let leftMovie;
let rightMovie;
const onSelect = async (movie, summaryElement, side) => {
  const res = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: "898f3943",
      i: movie.imdbID,
    },
  });
  summaryElement.innerHTML = movieTemplate(res.data);
  if (side === "left") {
    leftMovie = res.data;
  } else {
    rightMovie = res.data;
  }
  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );
  leftSideStats.forEach((leftStats, index) => {
    const rightStats = rightSideStats[index];
    let leftSideVal = leftStats.dataset.value;
    let rightSideVal = rightStats.dataset.value;

    if (leftSideVal.includes(".")) {
      leftSideVal = parseFloat(leftSideVal);
      rightSideVal = parseFloat(rightSideVal);
    } else {
      leftSideVal = parseInt(leftSideVal);
      rightSideVal = parseInt(rightSideVal);
    }

    if (leftSideVal > rightSideVal) {
      rightStats.classList.remove("is-primary");
      rightStats.classList.add("is-warning");
    } else {
      leftStats.classList.remove("is-primary");
      leftStats.classList.add("is-warning");
    }
  });
};

const movieTemplate = (Obj) => {
  const dollars = parseInt(Obj.BoxOffice.replace(/\$/g, "").replace(/,/g, ""));
  const metascore = parseInt(Obj.Metascore);
  const imdbrating = parseFloat(Obj.imdbRating);
  const imdbvotes = parseInt(Obj.imdbVotes.replace(/,/g, ""));
  const awards = Obj.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else return prev + value;
  }, 0);

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${Obj.Poster}"/>
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${Obj.Title} (${Obj.Year})</h1>
          <h4>${Obj.Genre}</h4>
          <p>${Obj.Plot}</p> 
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${Obj.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${Obj.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
      <p class="title">${Obj.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbrating} class="notification is-primary">
      <p class="title">${Obj.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbvotes} class="notification is-primary">
      <p class="title">${Obj.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};
