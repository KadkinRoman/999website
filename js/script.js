(function () {

  'use strict';

  document.querySelector('.material-design-hamburger__icon').addEventListener(
    'click',
    function () {
      var child;

      document.body.classList.toggle('background--blur');
      this.parentNode.nextElementSibling.classList.toggle('menu--on');

      child = this.childNodes[1].classList;

      if (child.contains('material-design-hamburger__icon--to-arrow')) {
        child.remove('material-design-hamburger__icon--to-arrow');
        child.add('material-design-hamburger__icon--from-arrow');
      } else {
        child.remove('material-design-hamburger__icon--from-arrow');
        child.add('material-design-hamburger__icon--to-arrow');
      }

    });

})();


const daysCounter = document.querySelector('#days-counter');
const hoursCounter = document.querySelector('#hours-counter');
const minutesCounter = document.querySelector('#minutes-counter');
const secondsCounter = document.querySelector('#seconds-counter');

const saleStart = { days: 16, hours: 8, minutes: 4, seconds: 2 };

let saleStartInSeconds = saleStart.seconds + 60 * saleStart.minutes + 3600 * saleStart.hours + 86400 * saleStart.days;
let provider;
let selectedAccount;
const contract_addr = "0x72Bb4c1Bb0ed4A70c907031503Bd4eFe1CBb3248"; // Insert contract address

async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  // document.querySelector("#connected").style.display = "none";
  // document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  fetchAccountData() // will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  document.querySelector("#buttonConnect").setAttribute("disabled", "disabled");
  await fetchAccountData(provider);
  document.querySelector("#buttonConnect").removeAttribute("disabled");
}


async function onConnect() {
  provider = await detectEthereumProvider()
  console.log(provider);
  if (provider) {
    web3 = new Web3(window.ethereum);
  } else {
    console.log("")
  }

  // Subscribe to accounts change
  ethereum.on("accountsChanged", (accounts) => {
    window.location.reload();
    fetchAccountData(provider);
  });

  // Subscribe to chainId change
  ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
    fetchAccountData(provider);
  });

  // Subscribe to networkId change
  ethereum.on("chainChanged", (networkId) => {
    fetchAccountData(provider);
  });

  await refreshAccountData(provider);
}


async function fetchAccountData() {
  document.querySelector("#buttonConnect").style.display = "none";
  const networks = { "0x38": "BSC Mainnet", "0x61": "BSC Testnet" };
  // Get connected chain id from Ethereum node
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  chainData = networks[chainId];
  console.log(await window.ethereum.request({ method: "eth_chainId" }));

  // document.querySelector("#network-name").textContent = chainData;

  // Get list of accounts of the connected wallet
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

  // MetaMask does not give you all accounts, only the selected account
  console.log("Account:", accounts[0]);
  selectedAccount = web3.utils.toChecksumAddress(accounts[0]);

  const balance = await provider.request({
    method: "eth_getBalance",
    params: [selectedAccount, "latest"],
  });
  let balance_token = await ethereum.request({
    method: "eth_call",
    params: [{
      to: contract_addr,
      data: web3.eth.abi.encodeFunctionCall({
        name: "balances",
        type: "function",
        inputs: [{
          type: "address",
          name: ""
        }]
      }, [selectedAccount])
    }, "latest"]
  });

  let decimals = await ethereum.request({
    method: "eth_call",
    params: [{
      to: contract_addr,
      data: web3.utils.sha3("decimals()")
    }, "latest"]
  });
  decimals = web3.eth.abi.decodeParameter("uint256", decimals);

  console.log(decimals);
  const balanceFromSpan = document.createElement('span');
  const balanceToSpan = document.createElement('span');
  const balanceFrom = document.querySelector("#balance");
  const balanceTo = document.querySelector("#balance_token");

  balanceFromSpan.textContent = web3.utils.fromWei(web3.utils.hexToNumberString(balance), "ether");
  balanceToSpan.textContent = web3.utils.hexToNumberString(balance_token) / (10 ** decimals);
  balanceFrom.textContent = "Balance (bnb): ";
  balanceTo.textContent = "Balance (token): ";
  balanceFrom.appendChild(balanceFromSpan);
  balanceTo.appendChild(balanceToSpan);
  document.querySelector("#address").textContent = selectedAccount.slice(0, 2) + "..." + selectedAccount.slice(-4);
  // document.querySelector(".wallet-address__header").setAttribute("title", selectedAccount);


  // Display fully loaded UI for wallet data
  document.querySelector("#buttonConnect").style.display = "none";
  // document.querySelector("#buttonSwitch").style.display = "block";
  document.querySelector("#buttonSwap").style.display = "block";
  document.querySelector("#balance").style.display = "block";
  document.querySelector("#balance_token").style.display = "block";
  document.querySelector(".wallet-address__header").style.display = "flex";
  document.querySelector(".buttonMaxValueToken").style.display = "block";
  document.querySelector(".switchWallet").style.display = "block";
  
}

async function onSwap() {
  // if (chainData === "BSC Mainnet") {
  const data = document.getElementById("inputvaluetokento").value;
  console.log(data)
  let price = await getPrice();
  let value = ((data * (10 ** 18)) / price); // Amount of tokens

  let y3 = await ethereum.request({
    method: "eth_call",
    params: [{
      to: contract_addr,
      data: web3.utils.sha3("y3()")
    }, "latest"]
  });
  y3 = web3.eth.abi.decodeParameter("uint256", y3);

  let scale3 = await ethereum.request({
    method: "eth_call",
    params: [{
      to: contract_addr,
      data: web3.utils.sha3("scale3()")
    }, "latest"]
  });
  scale3 = web3.eth.abi.decodeParameter("uint256", scale3);

  let swap = await ethereum.request({
    method: "eth_sendTransaction",
    params: [{
      from: selectedAccount,
      to: contract_addr,
      value: web3.utils.numberToHex(data * (10 ** 18) + (data * (10 ** 18) * y3 / scale3)),
      data: web3.utils.sha3("buy()"),
    }, "latest"]
  });
  console.log("TXID:", swap);
  // } else {
  //     await window.ethereum.request({
  //         method: "wallet_switchEthereumChain",
  //         params: [{ chainId: "0x38" }],
  //     });
  // }
}

async function getPrice() {
  let price = await ethereum.request({
    method: "eth_call",
    params: [{
      to: contract_addr,
      data: web3.utils.sha3("buyPrice()")
    }, "latest"]
  });
  return web3.eth.abi.decodeParameter("uint256", price);
}

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

});

/*Token switch*/
function switchTokens() {
  const panelInputFrom = document.querySelector(".panelinputFrom");
  const panelInputTo = document.querySelector(".panelinputTo");

  const balance = document.querySelector("#balance").cloneNode(true);;
  const balanceToken = document.querySelector("#balance_token").cloneNode(true);;

  const panelPairButtonDoge = panelInputFrom.querySelector(".panelpairbutton").cloneNode(true);
  const panelPairButtonBnb = panelInputTo.querySelector(".panelpairbutton").cloneNode(true);

  const buttonMaxValueToken = document.querySelector(".buttonMaxValueToken");

  const inputValueTokenfrom = document.querySelector("#inputvaluetokenfrom");
  
  if (inputValueTokenfrom.value !== "") {
    buttonMaxValueToken.style.display = "block";
  }

  panelInputTo.replaceChild(panelPairButtonDoge, panelInputTo.querySelector(".panelpairbutton"));
  panelInputFrom.replaceChild(panelPairButtonBnb, panelInputFrom.querySelector(".panelpairbutton"));

  // console.log(balance.textContent, balanceToken.textContent);
  // balance.textContent = balanceToken.textContent;
  document.querySelector("#balance").innerHTML = balanceToken.innerHTML;
  document.querySelector("#balance_token").innerHTML = balance.innerHTML;
  document.querySelector("#inputvaluetokenfrom").value = "";
  document.querySelector("#inputvaluetokento").value = "";
}

document.querySelector(".panelbuttonswitch").addEventListener("click", switchTokens);
/************************/

/*open setings*/
function openSettings() {
  const overlayScreen = document.querySelector(".overlayscreen");
  const panelSettingSlipPage = document.querySelector(".panelsettingslippage");

  overlayScreen.classList.add("overlayscreen-display")
  panelSettingSlipPage.classList.add("panelsettingslippage-display")

}
document.querySelector(".panelbuttons").addEventListener("click", openSettings);
/************************/

/*close setings*/
function closeSettings() {
  const overlayScreen = document.querySelector(".overlayscreen");
  const panelSettingSlipPage = document.querySelector(".panelsettingslippage");

  overlayScreen.classList.remove("overlayscreen-display")
  panelSettingSlipPage.classList.remove("panelsettingslippage-display")
}

document.querySelector(".buttonclosesettings").addEventListener("click", closeSettings);
document.querySelector(".overlayscreen").addEventListener("click", closeSettings);


const inputSlippageTolerance = document.querySelector("#inputslippagetolerance");
/*apply settings*/
function applySettings() {

  if (inputSlippageTolerance.value == 0) {
    inputSlippageTolerance.value = 1;
  }

  inputSlippageTolerance.value = parseFloat(inputSlippageTolerance.value.replace(/,/, '.'));

  inputSlippageTolerance.value = Number(inputSlippageTolerance.value).toFixed(2);

  const defaultValue = {
    "0.10": "buttonslipagge01",
    "0.50": "buttonslipagge05",
    "1.00": "buttonslipagge10"
  }
  const buttons = panelSettingSlippageButtons.querySelectorAll("button");
  if (!Object.keys(defaultValue).includes(inputSlippageTolerance.value)) {
    buttons.forEach(element => {
      element.classList.remove("buttonslipaggeselected");
    });
  } else {
    buttons.forEach(element => {
      element.classList.remove("buttonslipaggeselected");
    });

    document.querySelector(`#${defaultValue[inputSlippageTolerance.value]}`).classList.add("buttonslipaggeselected");
  }

  document.querySelector(".slippagevalue").textContent = inputSlippageTolerance.value + "%";
}

inputSlippageTolerance.addEventListener("change", applySettings);
/************************/

/*validate number*/
function validateInput() {

  let inputValue = inputSlippageTolerance.value;
  const maxValue = 49.99;

  const decimalPlaces = x => ((x.toString().includes('.')) ? (x.toString().split('.').pop().length) : (0));

  if (parseFloat(inputValue) > maxValue || decimalPlaces(inputValue) > 2) {
    inputSlippageTolerance.value = inputValue.slice(0, inputValue.length - 1);
  }

}

inputSlippageTolerance.addEventListener("input", validateInput);
/************************/

/*Slippage Tolerance Change*/

const panelSettingSlippageButtons = document.querySelector(".panelsettingslippagebuttons");

function slippageChange(e) {
  const buttonSlipagge01 = document.querySelector("#buttonslipagge01");
  const buttonSlipagge05 = document.querySelector("#buttonslipagge05");
  const buttonSlipagge10 = document.querySelector("#buttonslipagge10");
  const buttons = panelSettingSlippageButtons.querySelectorAll("button");

  if (buttonSlipagge01 === e.target) {
    inputSlippageTolerance.value = parseFloat(buttonSlipagge01.textContent).toFixed(2);
    buttons.forEach(element => {
      element.classList.remove("buttonslipaggeselected");
    });
    buttonSlipagge01.classList.add("buttonslipaggeselected");
    applySettings();
  }
  if (buttonSlipagge05 === e.target) {
    inputSlippageTolerance.value = parseFloat(buttonSlipagge05.textContent).toFixed(2);
    buttons.forEach(element => {
      element.classList.remove("buttonslipaggeselected");
    });
    buttonSlipagge05.classList.add("buttonslipaggeselected");
    applySettings();
  }
  if (buttonSlipagge10 === e.target) {
    inputSlippageTolerance.value = parseFloat(buttonSlipagge10.textContent).toFixed(2);
    buttons.forEach(element => {
      element.classList.remove("buttonslipaggeselected");
    });
    buttonSlipagge10.classList.add("buttonslipaggeselected");
    applySettings();
  }


}

panelSettingSlippageButtons.addEventListener("click", slippageChange);



/*Transaction Input*/
const inputTransactionDeadline = document.querySelector(".inputtransactiondeadline");
function validateTransactionInput() {
  if (parseFloat(inputTransactionDeadline.value) === 0) {
    inputTransactionDeadline.value = "1";
  }

  inputTransactionDeadline.value = inputTransactionDeadline.value.replace (/\D/, '')
}

inputTransactionDeadline.addEventListener("input", validateTransactionInput);


/*Transaction Input*/
const buttonMaxValueToken = document.querySelector(".buttonMaxValueToken");
function buttonMax() {
  const inputValueTokenfrom = document.querySelector("#inputvaluetokenfrom");
  const balanceFrom = document.querySelector(".balanceFrom");
  inputValueTokenfrom.value = balanceFrom.querySelector("span").textContent;
  buttonMaxValueToken.style.display = "none";
}

buttonMaxValueToken.addEventListener("click", buttonMax);
/********************/
/************************/

window.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("#buttonConnect").addEventListener("click", onConnect);
  document.querySelector("#buttonSwap").addEventListener("click", onSwap);
});