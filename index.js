const proxyurl = "https://sheltered-dawn-97733.herokuapp.com/";
const ITEMS_PER_CATEGORY_PAGE = 12;
const rsApi = new RSAPI;


const ARCHEOLOGY_MATERIAL_PRICE_TABLE_HEADER = "<div class='pt-2 row font-weight-bold text-uppercase text-center'>"
                                            +       "<div class='col'>Image</div>"
                                            +       "<div class='col'>Name</div>"
                                            +       "<div class='col'>Price</div>"
                                            +       "<div class='col'>Trend (Delta-Price)</div>"
                                            +   "</div>"
                                            + "<hr>";


var archeologyCatalogIndexes = [];
var archeologyMaterialList = [];
var archeologyMaterialPriceTool_STATE = "LOADING";



const fetchData = async (RESTcall) => {
    const response = await fetch(RESTcall);
    return response;
}

let getArcheologyCatalogue = async () => {
    let ARCHEOLOGY_CATEGORY_ID = 41;
    let request = rsApi.catalogueRequestFactory(ARCHEOLOGY_CATEGORY_ID);
    (await (await fetchData(proxyurl + request)).json()).alpha.forEach((index) => {
        if (index.items > 0){
            index.pageCount = (index.items < 12)? 1 : Math.ceil(index.items / 12);
            archeologyCatalogIndexes.push(index);
        }
    });
    //TODO add dictionary for these values
    getItemsFromCatalogue(ARCHEOLOGY_CATEGORY_ID, '#archeology-material-price-table', '#archeology-material-price-state');
}

let getItemsFromCatalogue = async (categoryId, htmlTableOutput, htmlStateOutput) => {
    for (index of archeologyCatalogIndexes){
        //TODO add functionality for multiple category pages
        let data = await (await fetchData(proxyurl + rsApi.categoryRequestFactory(categoryId, index.letter, 1))).json();
        for (item of data.items){
            archeologyMaterialList.push(item);
            $(htmlTableOutput).append(addRowInHTML(addColumnInHTML(addImageInHTML(item.icon)) 
                + addColumnInHTML(item.name) 
                + addColumnInHTML(item.current.price)
                + addColumnInHTML((item.today.trend.toLowerCase() === "negative"
                    ? makeRed(item.today.trend)
                    : makeGreen(item.today.trend))
                + " (" + item.today.price + ")")));
        }
    }
    setModuleState(htmlStateOutput, 'SORTING');
    let sortedMaterialList = archeologyMaterialList.sort(function(a, b) {
        return castToNumericFormat(a.current.price) < castToNumericFormat(b.current.price) ? 1 : -1;
    });

    console.log(sortedMaterialList);
    $(htmlTableOutput).html(ARCHEOLOGY_MATERIAL_PRICE_TABLE_HEADER)
    for (item of sortedMaterialList){
        $(htmlTableOutput).append(addRowInHTML(addColumnInHTML(addImageInHTML(item.icon)) 
        + addColumnInHTML(item.name) 
        + addColumnInHTML(item.current.price)
        + addColumnInHTML((item.today.trend.toLowerCase() === "negative"
                ? makeRed(item.today.trend)
                : makeGreen(item.today.trend))
            + " (" + item.today.price + ")")));
    }
    setModuleState(htmlStateOutput, 'DONE');
}

getArcheologyCatalogue();


function addColumnInHTML(data){
    return "<div class=\"col text-center\">" + data + "</div>";
}

function addImageInHTML(href){
    return "<img src=\"" + href + "\">";
}

function addRowInHTML(columns) {
    return "<div class=\"row\"> " + columns + "</div>";
}

function makeRed (html){
    return "<span style='color: tomato;'>" + html + "</span>";
}

function makeGreen (html){
    return "<span style='color: green;'>" + html + "</span>";
}

function setModuleState(_module, state){
    let spinnerHTML = "<div class='spinner-border text-primary' style='width: 1rem; height: 1rem;'"
        + "role='status'><span class='sr-only'>Loading...</span></div>";
    let checkmarkHTML = "<i class='fas fa-check' style='color: green;'></i>";

    if (state.toUpperCase() == "SORTING" ) {
        $(_module).html(' Sorting Data (almost done!)' + spinnerHTML);
    } else if (state.toUpperCase() == "DONE") {
        $(_module).html(' Done! ' + checkmarkHTML);
    }
}

function castToNumericFormat(stringNumber){
    stringNumber = stringNumber.toString();
    if(stringNumber.toLowerCase().includes('k')){
        return stringNumber.substring(0, stringNumber.length-1)*1000; // replacing K with 1,000s
    } else if (stringNumber.toLowerCase().includes('m')) {
        return stringNumber.substring(0, stringNumber.length-1)*1000000; //replacing M with 1,000,000s
    } else {
        return stringNumber.replace(/,/g, '')*1; //already numeric
    }
}

function RSAPI (){

    this.base_URL = 'http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?', //category=36&alpha=maple log&page=1'
    this.baseDetail_URL = 'http://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?', //item={itemId}
    this.catalogue_URL = 'http://services.runescape.com/m=itemdb_rs/api/catalogue/category.json?', //category={categoryId}
    this.category_URL = 'http://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?'; //category={categoryId}&alpha={firstLetter}&page={pageNumber}


    this.requestFactory = (category, string_search) => {
        return this.base_URL + "category=" + category + "&alpha=" + string_search + "&page=1";
    }

    this.itemDetail_requestFactory = (itemId) => {
        return this.baseDetail_URL + "item=" + itemId;
    }

    this.catalogueRequestFactory = (categoryId) => {
        return this.catalogue_URL + "category=" + categoryId;
    }

    this.categoryRequestFactory = (categoryId, firstLetter, pageNumber) => {
        return this.category_URL + "category=" + categoryId + "&alpha=" + firstLetter + "&page=" + pageNumber;
    }
}