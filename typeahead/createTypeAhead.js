var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//API CALL & Abort Controller!
let contoller = new AbortController();
let signal = contoller.signal;
const callAbortAndRenewController = () => {
    contoller.abort();
    contoller = new AbortController();
    signal = contoller.signal;
};
const getEmailSuggestions = (keyword) => {
    return fetch(`https://jsonplaceholder.typicode.com/comments?` + new URLSearchParams({
        query: keyword
    }), { signal: signal })
        .then((response) => response.json())
        .then((comments) => comments.map((comment) => comment.email))
        .then((comments) => comments.filter((comment) => comment.includes(keyword)))
        .catch((error) => []);
};
//Debounce Polyfill
const debounce = (fn, delay = 500) => {
    let timer;
    return function (...args) {
        const self = this;
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(self, args);
        }, delay);
    };
};
const throttle = (fn, delay = 500) => {
    let inThrottle = false;
    return function () {
        if (!inThrottle) {
            const that = this;
            const args = arguments;
            fn.apply(self, arguments);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, delay);
        }
    };
};
//Get Reference to DOM elements
const inputBox = document.getElementById('search-box');
const suggestionsBox = document.getElementById('suggestion-box');
//Reset Suggestions
const resetSuggestions = () => {
    console.log("Reset Sugesstions");
    suggestionsBox.classList.add('hide');
    suggestionsBox.classList.remove('show');
    suggestionsBox.innerHTML = "";
};
const showSuggestions = () => {
    suggestionsBox.classList.remove('hide');
    suggestionsBox.classList.add('show');
};
//Render Suggestions
const renderSuggestions = (suggestions) => {
    const fragment = document.createDocumentFragment();
    suggestions.forEach((suggestion) => {
        const item = document.createElement('div');
        item.textContent = suggestion;
        item.classList.add('option');
        item.setAttribute('data-key', suggestion);
        fragment.appendChild(item);
    });
    showSuggestions();
    suggestionsBox.innerHTML = "";
    suggestionsBox.append(fragment);
};
const handleSearch = (value) => __awaiter(this, void 0, void 0, function* () {
    try {
        //Do this before making an api call
        callAbortAndRenewController();
        const suggestions = yield getEmailSuggestions(value);
        console.log(suggestions);
        renderSuggestions(suggestions);
    }
    catch (error) {
    }
});
const handleInput = (event) => {
    var _a;
    const currentValue = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.value;
    console.log(currentValue);
    if (currentValue) {
        handleSearch(currentValue);
    }
    else {
        resetSuggestions();
    }
};
const handleSuggestionSelect = (event) => {
    var _a;
    console.log(event);
    const { key } = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.dataset;
    if (key) {
        inputBox.value = key;
        resetSuggestions();
    }
};
(() => {
    if (inputBox && suggestionsBox) {
        inputBox.addEventListener('input', ((event) => {
            debounce(handleInput(event));
        }));
        suggestionsBox.addEventListener('click', handleSuggestionSelect);
    }
})();
