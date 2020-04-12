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

 function ARCHEOLOGY_CATEGORY_MAPPINGS() {
    this.CATEGORY_ID = 41;
    this.HTML_TABLE_OUTPUT = '#archeology-material-price-table';
    this.HTML_STATE_OUTPUT = '#archeology-material-price-state';
    this.rowDataMapper = function (dto) {
        return addRowInHTML(addColumnInHTML(addImageInHTML(dto.icon)) 
            + addColumnInHTML(dto.name) 
            + addColumnInHTML(dto.current.price)
            + addColumnInHTML((dto.today.trend.toLowerCase() === "negative"
                ? makeRed(dto.today.trend)
                : makeGreen(dto.today.trend))
            + " (" + dto.today.price + ")"));
    }
 }



////////////////////
//script entry point
getPriceSortedItemsFromCatalogue(new ARCHEOLOGY_CATEGORY_MAPPINGS);


$('#archeology-section .collapse-button').on('click', () => {
    if ($('#archeology-material-price-table').is('.show')){
        $('#archeology-section .collapse-button .fas').css({
            "transition": "transform .5s",
            "transform": "rotate(1deg)"
        })
    } else {
        $('#archeology-section .collapse-button .fas').css({
            "transition": "transform .5s",
            "transform": "rotate(180deg)"
        })
    }
    $('#archeology-material-price-table').collapse('toggle');
});

function setModuleState(_module, state){
    let checkmarkHTML = "<i class='fas fa-check' style='color: green;'></i>";
    let errorHTML = "<i class='fas fa-times' style='color: tomato;'></i>";
    let spinnerHTML = "<div class='spinner-border text-primary' style='width: 1rem; height: 1rem;'"
        + "role='status'><span class='sr-only'>Loading...</span></div>";

    if (state.toUpperCase() == "LOADING") {
        $(_module).html(' Fetching data! ' + spinnerHTML);
    } else if (state.toUpperCase() == "SORTING" ) {
        $(_module).html(' Sorting data (almost done!) ' + spinnerHTML);
    } else if (state.toUpperCase() == "DONE") {
        $(_module).html(' Done! ' + checkmarkHTML);
    } else if (state.toUpperCase() == "ERROR"){
        $(_module).html(' Error processing request. ' + errorHTML);
    }
}