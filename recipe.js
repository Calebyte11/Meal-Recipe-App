
// ==============================GETTING DOCUMENTS===========================================
const popupContainerEl = document.getElementById('popup_container');

const randomMealsContainer = document.getElementById('random_meals_container_el');
const favMealsEl = document.getElementById('fav_meals_list');
const searchTermEl = document.getElementById('search_area');
const searchBtnEl = document.getElementById('search_button');

// ========= INVOKING OF FUNCTIONS ================

getRandomMeals();
fetchFavMeals();

            // ========random meals=========

async  function getRandomMeals (){
    const respRandom = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respRandomData = await respRandom.json();
     const randomMeals = respRandomData.meals[0];
     console.log(randomMeals);

     
     randomMealsContainer.innerHTML ="";
     loadRandomMeals(randomMeals, random = true);
};

//==========meals by search by id(basically for fetching favorite meals from local storage by 'IDs')======

async function getMealsById(id){
    const respMealsById = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i= ' +id);
    const respMealsByIdData = await respMealsById.json();
    const mealsById = respMealsByIdData.meals[0];

    return mealsById;
}

//===========meals by search by term or name=========

async function getMealsBySearchByTerms(term){
    const respMealsByTerm = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
    const respMealsByTermData = await respMealsByTerm.json();
    const mealsBySearch = respMealsByTermData.meals;
    return mealsBySearch;
};


// ===============LOADING RANDOM MEALS================

function loadRandomMeals(mealsData, random = null){

    console.log(`Random Meal's Id : ${mealsData.idMeal}`);    

    const meal = document.createElement('div');
    meal.classList.add('meals_container');
    meal.innerHTML = `

            ${random ? ` <span class="randoms_meal"> RANDOM MEALS</span>
            <button class="next_btn" onclick="getRandomMeals()" ><i class="fa-solid fa-angle-right"></i></button>
            ` : ""}
            
            <img src="${mealsData.strMealThumb}" alt="${mealsData.strMeal}" class="random_image">
            <div class="random_meals_and_button">
                <h3 class="random_meals_title">${mealsData.strMeal}</h3>
                <button style="cursor: pointer;" id="fav_button" class="fav_btn">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
    `;    
    randomMealsContainer.appendChild(meal);

    // ====clicking of the fav btn========

    const favBtnEl = meal.querySelector('.random_meals_and_button .fav_btn');

    favBtnEl.addEventListener('click', () => {

        if(favBtnEl.classList.contains("active")){

            removeMealsFromLocalStorge(mealsData.idMeal);
            favBtnEl.classList.remove("active");
            
        }
        else{

            addMealsToLocalStorage(mealsData.idMeal);
            favBtnEl.classList.add("active");
            
        }
        fetchFavMeals();
        
    });

     // ========having active or inactive favourite button =======
     const mealsIds = getMealsLocalStorage();
     if ([...mealsIds].includes(mealsData.idMeal)) {
        const favBtnEl = meal.querySelector('.random_meals_and_button .fav_btn');
        favBtnEl.classList.add("active")
        console.log('already saved');
     }

    // =========== activating of  meal popup =============

    meal.querySelector('.random_image').addEventListener('click', () => {
        console.log('call_back_popup');
        getPopup(mealsData);
    });
    
};

// ===========================FETCHING FAVOURITE MEALS BY IDS ================

async function fetchFavMeals (){

    //cleaning the favourite container===== 

    favMealsEl.innerHTML = "";

    const mealsIds = getMealsLocalStorage();

    for(let i = 0 ; i<mealsIds.length ; i++ ){
        const mealsId = mealsIds[i];
        mealsById = await getMealsById(mealsId);

                
        addFavMeals(mealsById);
    }
};

function addFavMeals(mealsData){

    console.log(`favorited meal id is : ${mealsById.idMeal}`);

    const favMeals = document.createElement('li');
    favMeals.classList.add('images_list');
    favMeals.innerHTML = `
                <button id="clear_button" class="clear_btn">
                    <i class="fa-solid fa-circle-xmark"></i>
                </button>
                <img class="fav_images" src="${mealsData.strMealThumb}" alt="${mealsById.strMeal}">
                <span class="fav_meals_text" >${mealsData.strMeal}</span>
                
            
    `;
    favMealsEl.appendChild(favMeals);

    // ==========clicking of clear button==========

    const clearBtnEL = favMeals.querySelector('.images_list .clear_btn');

    clearBtnEL.addEventListener('click', () => {
        favMeals.innerHTML= "";
        removeMealsFromLocalStorge(mealsData.idMeal);
                console.log(`${mealsData.idMeal}`);
        
        fetchFavMeals();

        //======================================

        const favBtnEl = document.querySelector('.random_meals_and_button .fav_btn');
        favBtnEl.classList.remove("active");

    });

    // =========== activating of  meal popup =============

    favMeals.querySelector('.images_list .fav_images').addEventListener('click', () => {
        console.log('call_back_popup');
        getPopup(mealsData);
    });

   

    
};


//=============== SEARCH MEALS BY TERMS ==============

searchBtnEl.addEventListener('click', async () => {

    //clean the random meals container first ====

    randomMealsContainer.innerHTML = '';
    
    const search = searchTermEl.value;
    console.log(JSON.stringify(`${search}`));
    const searchedMeals = await getMealsBySearchByTerms(search);
    console.log(searchedMeals);

    if (searchedMeals) {
        searchedMeals.forEach( (searchedMeal)  => {
            loadRandomMeals(searchedMeal);
        });
    }

    if(searchedMeals === null){
        randomMealsContainer.innerHTML = `<h5 style="font-size:25px; text-align:center;margin-top:70px; background-color: white; width:400px"> Sorry !!!!! ,the Meal was not found!!</h5>`
    }

});


// =================== MEALS INFO POP UP =====================

function getPopup(mealsData){

    //======== First,, cleaning of the body container =========

    const bodyEl = document.querySelector('.body_container');
    bodyEl.classList.add('hidden');

    // ======== getting the ingredients and measures (in form of arrays) ======

    const ingredientsAndMeasuresArrays = [];

    for (y = 1; y <= 20 ; y++) {
        if (mealsData['strIngredient'+y]) {
            ingredientsAndMeasuresArrays.push(`${mealsData['strIngredient'+y]} : ${mealsData['strMeasure' + y]}`);
            
        } else if (mealsData['strIngredient'+y] === "")  {
            break;
        };  
    };
    
    console.log(JSON.stringify(ingredientsAndMeasuresArrays));

    //===================== creaating innerHTMl for popup container =================

    popupContainerEl.classList.remove('hidden');
    popupContainerEl.innerHTML = `
        
        <div id="popup_info_header" class="popup_info_header">
                    
        <h1 id="meal_info_title" class="meal_info_title" >${mealsData.strMeal}</h1>
        
        <button id="close_popup" class="close_popup">
            <i class="fa-solid fa-xmark"></i>
        </button>

    </div>

    <div class="meal_info_body">
        <img id="popup_image" src="${mealsData.strMealThumb}" alt="${mealsData.strMeal}" class="popup_image">

        <h3 id="meal_area">Meal Area : ${mealsData.strArea}</h3>
        <h3 id="meal_category">Meal Category : ${mealsData.strCategory} </h3>
        <h4 id="meal_procedures">Meal Procedures :  </h3>

        <p id="meal_info_descriptions" class="meal_info_descriptions">${mealsData.strInstructions}</p>
        <span style="text-align: justify; margin-left: 50px; font-size: 20px;font-weight: bolder;">Ingredients and Measures : </span>

        <ul class="ingredient_list">
            ${ingredientsAndMeasuresArrays
                .map(
                    (ing) => `
                    <li>${ing}</li>
                    `
                )
                .join('')}
        </ul>
    </div>

        `;
    // ======= close popup button ============

    const popupCloseBtnEl = document.querySelector('.popup_info_header  .close_popup');
    popupCloseBtnEl.addEventListener( 'click', () => {
        console.log('close popup');
        popupContainerEl.classList.add('hidden');
        bodyEl.classList.remove('hidden');
    });
};

// ================= USING LOCAL STORAGE ====================

function getMealsLocalStorage(){
    const mealsIds = JSON.parse(localStorage.getItem('mealsIds'));
    return mealsIds === null ? [] : mealsIds ;
};

function addMealsToLocalStorage (mealsId) {
    const mealsIds = getMealsLocalStorage();
    localStorage.setItem('mealsIds' ,JSON.stringify([...mealsIds,mealsId]));
    if ([...mealsIds].includes(mealsId)) {
        localStorage.setItem('mealsIds' ,JSON.stringify([...mealsIds]))
    }

    const favBtnEl = document.querySelector('.random_meals_and_button .fav_btn');
    favBtnEl.classList.contains("active");
};

function removeMealsFromLocalStorge(mealsId){
    const mealsIds = getMealsLocalStorage();
    localStorage.setItem('mealsIds', JSON.stringify( mealsIds.filter((id) => id !== mealsId)));

};