
const daysCounter = document.querySelector('#days-counter');
const hoursCounter = document.querySelector('#hours-counter');
const minutesCounter = document.querySelector('#minutes-counter');
const secondsCounter = document.querySelector('#seconds-counter');

const saleStart = {days: 16, hours: 8, minutes: 4, seconds: 2};

let saleStartInSeconds = saleStart.seconds + 60 * saleStart.minutes + 3600 * saleStart.hours + 86400 * saleStart.days;

let timeout = setTimeout(function timeoutFunc() {  
  let saleStartInSecondsCopy = saleStartInSeconds;
  
  const days = Math.trunc(saleStartInSecondsCopy / 86400);
  
  daysCounter.innerHTML = `${days}`.padStart(2, '0');
  
  saleStartInSecondsCopy -= days * 86400;
  
  const hours = Math.trunc(saleStartInSecondsCopy / 3600);
  
  hoursCounter.innerHTML = `${hours}`.padStart(2, '0');
  
  saleStartInSecondsCopy -= hours * 3600;
  
  const minutes = Math.trunc(saleStartInSecondsCopy / 60);
  
  minutesCounter.innerHTML = `${minutes}`.padStart(2, '0');
  
  saleStartInSecondsCopy -= minutes * 60;
  
  secondsCounter.innerHTML = `${saleStartInSecondsCopy}`.padStart(2, '0');  
  
  --saleStartInSeconds;
  
  timeout = setTimeout(timeoutFunc, 1000);
  
  if (saleStartInSeconds < 0) {
    clearTimeout(timeout);
  }
}, 1000);

var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Presale', 'Liquidity', 'Locked', 'Unlocked'],
                datasets: [{
                    label: '# of Votes',
                    data: [25, 14, 25, 35],
                    backgroundColor: [
                        '#fd728f',
                        '#049bff',
                        '#a87ef7',
                        '#ffcd56'
                    ],
                    borderColor: [
                        '#171923'
                    ],
                    hoverOffset: 4
                }]
             },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  color: 'white',
                  labels: {
                    
                  }
                },
                title: {
                  display: true,
                  
                },
              }
            },
            
          }
    );