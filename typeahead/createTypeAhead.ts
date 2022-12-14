interface IComment{
    postId:number;
    id:number;
    name:string;
    email:string;
    body:string;
}


//API CALL & Abort Controller!

let contoller = new AbortController();
let signal = contoller.signal;

const callAbortAndRenewController = () =>{
    contoller.abort();
    contoller = new AbortController();
    signal=contoller.signal;
}

const getEmailSuggestions = (keyword:string)  =>{

   return fetch(`https://jsonplaceholder.typicode.com/comments?`+new URLSearchParams({
    query:keyword}),{signal:signal})
    .then((response:Response)=> response.json() )
    .then((comments:IComment[])=>  comments.map((comment)=>comment.email) )
    .then((comments:string[])=>comments.filter((comment)=>comment.includes(keyword)))
    .catch((error)=>[])
}

//Debounce Polyfill

const debounce = (fn:any,delay=500)=>{
    let timer:any|undefined;
    return function(...args:any[])
    {
        const self:any=this;
        clearTimeout(timer);
        timer = setTimeout(()=>{
        fn.apply(self,args);
       },delay) 
    }
}

const throttle = (fn:Function,delay=500) => {
    let inThrottle=false;
    return function()
    {
        if(!inThrottle)
        {
            const that=this;
            const args=arguments;
            fn.apply(self,arguments);
            inThrottle=true;
            setTimeout(()=>{
                inThrottle=false;
            },delay)
        }

    }
}


//Get Reference to DOM elements
const inputBox = document.getElementById('search-box') as HTMLInputElement;
const suggestionsBox = document.getElementById('suggestion-box') as HTMLElement;

//Reset Suggestions

const resetSuggestions=()=>{
    console.log("Reset Sugesstions")
    suggestionsBox.classList.add('hide');
    suggestionsBox.classList.remove('show');
    suggestionsBox.innerHTML="";
}
const showSuggestions=()=>{
    suggestionsBox.classList.remove('hide');
    suggestionsBox.classList.add('show');
}

//Render Suggestions
const renderSuggestions = (suggestions:string[]) =>{
    const fragment = document.createDocumentFragment();
    suggestions.forEach((suggestion)=>{
        const item = document.createElement('div');
        item.textContent=suggestion;
        item.classList.add('option');
        item.setAttribute('data-key',suggestion);
        fragment.appendChild(item);
    })
    showSuggestions();
    suggestionsBox.innerHTML="";
    suggestionsBox.append(fragment);
}

const handleSearch = async (value:string) => {
   try {

    //Do this before making an api call
    callAbortAndRenewController();

    const suggestions = await getEmailSuggestions(value);
    console.log(suggestions);
    renderSuggestions(suggestions);

   } catch (error) {
    
   }
}

const handleInput = (event:any) => {

    const currentValue:string = event?.target?.value;
    console.log(currentValue);
    if(currentValue)
    {
        handleSearch(currentValue);
    }
    else
    {
        resetSuggestions();
    }

}

const handleSuggestionSelect = (event:any) => {
    console.log(event);
    const {key} = event?.target?.dataset;
    if(key)
    {
        inputBox.value=key;
        resetSuggestions();
    }
}

(()=>{
   if(inputBox && suggestionsBox)
   {
    inputBox.addEventListener('input',((event)=>{
        debounce(handleInput(event))
    }));
    suggestionsBox.addEventListener('click',handleSuggestionSelect)
   }
})();