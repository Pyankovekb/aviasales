import $ from 'jquery';
import popper from 'popper.js';
import bootstrap from 'bootstrap';

// окей, при изменении формы чекбоксов отправляем запрос
// затем фильтруем и рендерим билеты 
$('#stops').change(function(){
    let ticketList;
    $.ajax({
        beforeSend: function() {
            $('#hiddenLoader').css('opacity', '1');
        },
        url: '../tickets.json',
        success: function(data) {
            ticketList = [].concat(data.tickets);
        },

        complete: function(){
            $('#ticket').empty();
            setTimeout(() => {                      // задержка для эмитации загрузки
                ticketList.filter(function(item){
                    let stops = item.stops;
                    return getStops().indexOf(String(stops)) >= 0;
                }).sort(compare)
                .forEach(function(item){
                    render(item);
                });
                $('#hiddenLoader').css('opacity','0')
            }, 400);
            
            
        }
    });
        //функция сортировки
    function compare(a,b) {
        if(a.price > b.price) return 1;
        if(a.price < b.price) return -1;
    };
});
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

// функция используется при рендере билетов
// и выводит билеты сразу в выбраной валюте
function curencyChecker(value) {
    if(getCurr() === 'USD') {
        return Math.round(Number(value) * Number(currObj.RUB_USD)) + ' USD';
    } else if(getCurr() === 'EUR'){
        return Math.round(Number(value) * Number(currObj.RUB_EUR)) + ' EUR';
    } else {
        return value + ' RUB'
    }
};
// очень топорная функция переключения валют в билетах
// как то лучше сделать я пока не додумал 
$('#currency').change(function(){
    let curr = getCurr();
    if(curr === 'USD') {

        if(($('#pricing').html()).indexOf('EUR') > 0){
            console.log('FROM EUR TO USD');
            $('* #pricing').html(function(){ 
                return Math.round(parseInt($(this).html()) * 1.1382) + ' USD';
            });
        };
        if(($('#pricing').html()).indexOf('RUB') > 0){
            $('* #pricing').html(function(){ 
                return Math.round(parseInt($(this).html()) * currObj.RUB_USD) + ' USD';
            });
        };
    };
    if(curr === 'EUR'){

        if(($('#pricing').html()).indexOf('USD') > 0){
            console.log('FROM USD TO EUR');
            $('* #pricing').html(function(){ 
                return Math.round(parseInt($(this).html()) / 1.1382) + ' EUR';
            });
        };
        if(($('#pricing').html()).indexOf('RUB') > 0){
            $('* #pricing').html(function(){ 
                return Math.round(parseInt($(this).html()) * currObj.RUB_EUR) + ' EUR';
            });
        };
    } 
    if(curr ==='RUB') {

        if(($('#pricing').html()).indexOf('USD') > 0){
            $('* #pricing').html(function(){ 
                return (Math.round(Math.round(parseInt($(this).html()) / currObj.RUB_USD)/100)) * 100 + ' RUB';
            });
        };
        if(($('#pricing').html()).indexOf('EUR') > 0){
            $('* #pricing').html(function(){ 
                return (Math.round(Math.round(parseInt($(this).html()) / currObj.RUB_EUR)/100)) * 100 + ' RUB';;
            });
        };
    };
});

// функция рендера билетов с шаблоном
function render(item) {
    let myTicket = $(`<div class="ticket row">
    <div class="col-lg-4 pricing">
        <img src="img/turk.png">
        <button id="buyTicket" class="btn btn-warning">Купить за <br><span id="pricing">${curencyChecker(item.price)}</span></button>
    </div>
    <div class="col-lg-8 flight row">
        <div class="departure col">
            <h2>${item.departure_time}</h2>
            <p><b>${item.origin}, ${item.origin_name}</b></p>
            <p>${dateFormat(item.departure_date)}</p>
        </div>
        <p class="transfer col">${stopsFormater(item.stops)}</p>
        <div class="arrival col">
            <h2>${item.arrival_time}</h2>
            <p><b>${item.destination_name}, ${item.destination}</b></p>
            <p>${dateFormat(item.arrival_date)}</p>
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
    console.log(typeof stops);
    if(stops == 0 || stops > 4) {
        return stops + ' пересадок'
    } else if(stops == 1) {
        return stops + ' пересадка'
    } else if(stops > 1 && stops < 5) {
        return stops + ' пересадки'
    }
}