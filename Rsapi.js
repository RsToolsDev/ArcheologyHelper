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

const fetchData = async (RESTcall) => {
    const response = await fetch(RESTcall);
    return response;
}

let getCatalogue = async (categoryId) => {
    const CATALOGUE_PAGE_SIZE = 12;
    let catalogue = [];
    (await (await fetchData(proxyurl + rsApi.catalogueRequestFactory(categoryId))).json()).alpha.forEach((index) => {
        if (index.items > 0){
            index.pageCount = (index.items < CATALOGUE_PAGE_SIZE)? 1 : Math.ceil(index.items / CATALOGUE_PAGE_SIZE);
            catalogue.push(index);
        }
    });
    return catalogue;
}

let getPriceSortedItemsFromCatalogue = async (moduleMapper) => {
    let categoryId = moduleMapper.CATEGORY_ID;
    let htmlTableOutput = moduleMapper.HTML_TABLE_OUTPUT;
    let htmlStateOutput = moduleMapper.HTML_STATE_OUTPUT;
    let moduleRowDataMapper = moduleMapper.rowDataMapper;
    let itemList = [];

    setModuleState(htmlStateOutput, "LOADING");
    let catalogue = await getCatalogue(categoryId);

    for (index of catalogue){
        for(let pageNumber = 0; pageNumber < index.pageCount; pageNumber++ ){
            try{
                let response = await fetchData(proxyurl 
                    + rsApi.categoryRequestFactory(categoryId, index.letter, pageNumber));
                let data = await response.json();
                for (item of data.items){
                    itemList.push(item);
                    $(htmlTableOutput).append(moduleRowDataMapper(item));
                }
            } catch (exception) {
                setModuleState(htmlStateOutput, 'ERROR');
            }
        }
    }

    setModuleState(htmlStateOutput, 'SORTING');
    let sortedItemList = itemList.sort(function(a, b) {
        return castToNumericFormat(a.current.price) < castToNumericFormat(b.current.price) ? 1 : -1;
    });

    console.log(sortedItemList);
    $(htmlTableOutput).html(ARCHEOLOGY_MATERIAL_PRICE_TABLE_HEADER)
    for (item of sortedItemList){
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