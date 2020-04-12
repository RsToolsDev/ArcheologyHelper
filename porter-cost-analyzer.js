function PORTER_COST_CATEGORY_MAPPINGS() {
    this.CATEGORY_ID = 0;
    this.HTML_TABLE_OUTPUT = '#porter-cost-table';
    this.HTML_STATE_OUTPUT = '#porter-cost-state';
    this.TABLE_HEADER = "<div class='pt-2 row font-weight-bold text-uppercase text-center'>"
                                                +    "<div class='col-1'>Tier</div>"
                                                +    "<div class='col-4 text-left pl-5'>Energy (Price)</div>"
                                                +    "<div class='col-3 text-left'>Necklace Needed (price)</div>"
                                                +    "<div class='col-2'>Charges (Price/Charge)</div>"
                                                +    "<div class='col-2'>Price per GOTE recharge</div>"
                                                + "</div>"
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


 var porters = [
    { "tier":"Tier 1", "charges":"5", "energy":"pale energy", "energyAmount":30, "jewelry":"sapphire necklace"},
    { "tier":"Tier 2", "charges":"10", "energy":"bright energy", "energyAmount":35, "jewelry":"sapphire necklace"},
    { "tier":"Tier 3", "charges":"15", "energy":"sparkling energy", "energyAmount":40, "jewelry":"emerald necklace"},
    { "tier":"Tier 4", "charges":"20", "energy":"vibrant energy", "energyAmount":45, "jewelry":"emerald necklace"},
    { "tier":"Tier 5", "charges":"25", "energy":"radiant energy", "energyAmount":60, "jewelry":"ruby necklace"},
    { "tier":"Tier 6", "charges":"30", "energy":"incandescent energy", "energyAmount":80, "jewelry":"diamond necklace"}
]

var context = new PORTER_COST_CATEGORY_MAPPINGS;
$(context.HTML_TABLE_OUTPUT).html(context.TABLE_HEADER);
let promise1 = getPriceDependencies().then();

async function getPriceDependencies(){
    
    setModuleState("#porter-cost-state", "LOADING");

    for (porter of porters){
        try{
            let energyData = await (await fetch(proxyurl + rsApi.requestFactory(0, porter.energy, 1))).json();
            porter.energyPrice = energyData.items[0].current.price;
            porter.energyIcon = energyData.items[0].icon;
            let jewelryData = await (await fetch(proxyurl + rsApi.requestFactory(16, porter.jewelry, 1))).json();
            porter.jewelryCost = jewelryData.items[0].current.price;
            porter.jewelryIcon = jewelryData.items[0].icon;
        } catch(error){
            setModuleState("#porter-cost-state", "ERROR")
        }
    }

    let tableData = '';
    setModuleState("#porter-cost-state", "CALCULATING");
    porters.forEach((porter) => {
        console.log(porter.energyIcon)
        let priceOfEnergy = castToNumericFormat(porter.energyPrice) * porter.energyAmount;
        let totalPrice = priceOfEnergy + castToNumericFormat(porter.jewelryCost);
        let pricePerCharge = Math.ceil(totalPrice/porter.charges);
        tableData += addRowInHTML(addColumnInHTML(porter.tier, 'col-1') 
            + addColumnInHTML(addImageInHTML(porter.energyIcon) + " " 
                + porter.energyAmount + " x " 
                + porter.energy.replace(' energy', '')
                + " (" + priceOfEnergy + " gp) ", 'col-4', "text-left")
            + addColumnInHTML(addImageInHTML(porter.jewelryIcon) + " " 
                + porter.jewelry.replace(' necklace', '')
                + " (" + porter.jewelryCost + " gp) " , 'col-3', 'text-left')
            + addColumnInHTML(porter.charges + " (" + pricePerCharge + " gp) " , 'col-2')
            + addColumnInHTML(pricePerCharge * .5 + "K", 'col-2'));
    });
    $(context.HTML_TABLE_OUTPUT).append(tableData);
    setModuleState("#porter-cost-state", "DONE")
}



$('#porter-cost-module .collapse-button').on('click', () => {
    if ($('#porter-cost-table').is('.show')){
        $('#porter-cost-module .collapse-button .fas').css({
            "transition": "transform .5s",
            "transform": "rotate(1deg)"
        })
    } else {
        $('#porter-cost-module .collapse-button .fas').css({
            "transition": "transform .5s",
            "transform": "rotate(180deg)"
        })
    }
    $('#porter-cost-table').collapse('toggle');
});
