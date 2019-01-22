import $ from 'jquery';
import popper from 'popper.js';
import bootstrap from 'bootstrap';

class Ticket {
    constructor({price, stops, departure_time, departure_date,
                 arrival_time, arrival_date, origin, origin_name,
                    destination, destination_name}) {
        this.price = price;
        this.stops = stops;
        this.departureTime = departure_time;
        this.departureDate = departure_date;
        this.arrivalTime = arrival_time;
        this.arrivalDate = arrival_date;
        this.origin = origin;
        this.originName = origin_name;
        this.destination = destination;
        this.destinationName = destination_name;
        this.oldPrice = price;
    };

    priceToggle(){
        switch(getCurr()){
            case 'USD':
                this.price = Math.round(Number(this.oldPrice) * currObj.RUB_USD)+ ' USD';
                break;
            case 'EUR':
                this.price = Math.round(Number(this.oldPrice) * currObj.RUB_EUR) + ' EUR';
                break;
            default: 
                this.price = this.oldPrice + ' RUB';
                break;
        }
    }
}

let ticketList = [];

const updateLists = (list) => {
    $('#ticket').empty();
    list.filter(function(item){
        let stops = item.stops;
        return getStops().indexOf(String(stops)) >= 0;
    }).sort(compare)
    .forEach(function(item){
        item.priceToggle();
        render(item);
    });
};


// окей, при изменении формы чекбоксов отправляем запрос
// затем фильтруем и рендерим билеты 
$('#stops').change(function(){
    $.ajax({
        beforeSend: function() {
            $('#hiddenLoader').css('opacity', '1');
        },
        url: '../tickets.json',
        success: function(data) {
            ticketList = [];
            data.tickets.forEach((item) => {
                ticketList.push(new Ticket(item));
            });
        },
        complete: function(){
            $('#ticket').empty();
            setTimeout(() => {                      // задержка для эмитации загрузки
                updateLists(ticketList);
                $('#hiddenLoader').css('opacity','0')
            }, 400);
        }
    });
});
//функция сортировки 
function compare(a,b) {
    if(a.price > b.price) return 1;
    if(a.price < b.price) return -1;
};
// логика переключателей чекбоксов 
$('#stops').click(function(element){
    let stopList = $(this).find('input'); 
    if(element.target.id == 'all' && $(element.target).prop('checked') == true) {
        for(let i = 0; i< stopList.length; i++) {
            $(stopList[i]).prop('checked', true);
        }
    } else if(element.target.id == 'all' && $(element.target).prop('checked', false)){
        for(let i = 0; i< stopList.length; i++) {
            $(stopList[i]).prop('checked', false);
        }
    };
});

// при наведении на чекбокс показывать SPAN 'только'
$('#stops').find('label').mouseover(function(event){
    let stopList = $('#stops').find('input');
    let showOnly = $(event.target).find('span');

    showOnly.removeClass('hidden');
    
    $(showOnly).click(function(){
        for(let i = 0; i< stopList.length; i++) {
            $(stopList[i]).prop('checked', false);
        }
    });
});
// при уходе с чекбокс спрятать SPAN 'только'(так лучше работает)
$('#stops').find('label').mouseleave(function(event){
    let showOnly = $(event.target).find('span');
    showOnly.addClass('hidden');
});

// функция для получения активных чекбоксов для фильтрации
function getStops() {
    let stopArr = [];
    let stops = $('#stops').find('input');

    for(let i = 0; i < stops.length; i++) {
        if($(stops[i]).prop('checked')) stopArr.push(stops[i].id);
    }
    return stopArr;
};

//объект с котировками валют
var currObj = {};
$.ajax({
    url: 'https://free.currencyconverterapi.com/api/v6/convert?q=RUB_USD,RUB_EUR&compact=ultra',
    success: function(data){
        for (let key in data) {
            currObj[key] = data[key];
        }
    },
    error: function() {
        currObj.RUB_USD = 0.015115;    //стоит ограничение на количество 
        currObj.RUB_EUR = 0.013279;    // запросов за промежуток времени
    }
});
// функция переключения активной валюты
$('#currency').click(function(event){
    let cur = $(this).find('input');
    let input = event.target.firstChild;

    for(let i = 0; i < cur.length; i++){
        if($(cur[i]).attr('checked')) {
            $(cur[i]).attr('checked', false);
        }
    };
    $(input).attr('checked', true);
    ticketList.forEach((item) => item.priceToggle());
    updateLists(ticketList);
});
// функция получения текущей валюты 
function getCurr() {
    let cur = $('#currency').find('input');
    let currentCur = '';

    for(let i = 0; i < cur.length; i++) {
        if($(cur[i]).attr('checked')) {
           currentCur = cur[i].id;
           break;
        }
    }
    return currentCur;
};

// функция рендера билетов с шаблоном
function render(item) {
    let myTicket = $(`<div class="ticket row">
                        <div class="col-lg-4 pricing">
                            <img src="../img/turk.png">
                            <button id="buyTicket" class="btn btn-warning">Купить за <br><span id="pricing">${item.price}</span></button>
                        </div>
                        <div class="col-lg-8 flight row">
                            <div class="departure col">
                                <h2>${item.departureTime}</h2>
                                <p><b>${item.origin}, ${item.originName}</b></p>
                                <p>${dateFormat(item.departureDate)}</p>
                            </div>
                            <p class="transfer col">${stopsFormater(item.stops)}</p>
                            <div class="arrival col">
                                <h2>${item.arrivalTime}</h2>
                                <p><b>${item.destinationName}, ${item.destination}</b></p>
                                <p>${dateFormat(item.arrivalDate)}</p>
                            </div>
                        </div>
                    </div>`);
    $('#ticket').append(myTicket);
};

// функция форматирования даты
function dateFormat (date) {
    let newDate = new Date(date);
    let options = {
        day: 'numeric',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
    }
    return newDate.toLocaleString('ru', options);
};


//функция форматирования строки с количеством пересадок
function stopsFormater(stops) {
    if(stops == 0 || stops > 4) {
        return stops + ' пересадок'
    } else if(stops == 1) {
        return stops + ' пересадка'
    } else if(stops > 1 && stops < 5) {
        return stops + ' пересадки'
    }
}