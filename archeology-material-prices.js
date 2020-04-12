 function ARCHEOLOGY_CATEGORY_MAPPINGS() {
    this.CATEGORY_ID = 41;
    this.HTML_TABLE_OUTPUT = '#archeology-material-price-table';
    this.HTML_STATE_OUTPUT = '#archeology-material-price-state';
    this.ARCHEOLOGY_MATERIAL_PRICE_TABLE_HEADER = "<div class='pt-2 row font-weight-bold text-uppercase text-center'>"
                                                +       "<div class='col'>Image</div>"
                                                +       "<div class='col'>Name</div>"
                                                +       "<div class='col'>Price</div>"
                                                +       "<div class='col'>Trend (Delta-Price)</div>"
                                                +   "</div>"
                                                + "<hr>";

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


 getPriceSortedItemsFromCatalogue(new ARCHEOLOGY_CATEGORY_MAPPINGS);


$('#archeology-material-module .collapse-button').on('click', () => {
    if ($('#archeology-material-price-table').is('.show')){
        $('#archeology-material-module .collapse-button .fas').css({
            "transition": "transform .5s",
            "transform": "rotate(1deg)"
        })
    } else {
        $('#archeology-material-module .collapse-button .fas').css({
            "transition": "transform .5s",
            "transform": "rotate(180deg)"
        })
    }
    $('#archeology-material-price-table').collapse('toggle');
});