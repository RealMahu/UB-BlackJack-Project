import inquirer from 'inquirer';
 
const symbole = ["♥", "♠", "♦", "♣"];
const werte = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Bube", "Dame", "König", "Ass"];
const karten = [];
 

const spielerName = await inquirer.prompt([
    {
        type: 'input',
        name: 'name',
        message: 'Bitte gib deinen Namen ein:'
    }
]);
console.log(`Willkommen beim Blackjack, ${spielerName.name}!\n`);
 
function deckZuruecksetzen() {
    karten.length = 0;
 
    for (const symbol of symbole) {
        for (const wert of werte) {
            karten.push(`${wert} ${symbol}`);
        }
    }
 
    for (let i = karten.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [karten[i], karten[j]] = [karten[j], karten[i]];
    }
}
 
function karteZiehen() {
    const zufallsIndex = Math.floor(Math.random() * karten.length);
    return karten.splice(zufallsIndex, 1)[0];
}
 
function handWert(hand) {
    let wert = 0;
    let asse = 0;
    for (const karte of hand) {
        const wort = karte.split(" ")[0];
        if (wort === "Ass") {
            wert += 11;
            asse++;
        } else if (wort === "König" || wort === "Dame" || wort === "Bube") {
            wert += 10;
        } else {
            wert += parseInt(wort, 10);
        }
    }
    while (wert > 21 && asse > 0) {
        wert -= 10;
        asse--;
    }
    return wert;
}

function anzeigenHand(hand) {
    process.stdout.write('\x1B[2J\x1B[H'); 
    console.log(`Spielerhand: ${hand[0]}`);
    console.log(`Dealerhand: ${hand[1]}`);
}
 
async function blackjackSpiel() {
    let weiterspielen = true;
 
    while (weiterspielen) {
        deckZuruecksetzen();
        const spielerHand = [karteZiehen(), karteZiehen()];
        const dealerHand = [karteZiehen(), karteZiehen()];
        let spielerWert = handWert(spielerHand);
        let dealerWert = handWert(dealerHand);
        anzeigenHand([spielerHand.join(", ") + ` (Gesamtwert: ${spielerWert})`, dealerHand[0] + ", ?"]);
 
        while (spielerWert < 21) {
            const zug = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'aktion',
                    message: 'Möchtest du eine weitere Karte ziehen (Hit) oder Stehen bleiben (Stand)?',
                    choices: ['Hit', 'Stand']
                }
            ]);
 
            if (zug.aktion === 'Hit') {
                const neueKarte = karteZiehen();
                spielerHand.push(neueKarte);
                spielerWert = handWert(spielerHand);
                anzeigenHand([spielerHand.join(", ") + ` (Gesamtwert: ${spielerWert})`, dealerHand[0] + ", ?"]);
            } else if (zug.aktion === 'Stand') {
                break;
            }
        }
 
        while (dealerWert < 17) {
            const neueKarte = karteZiehen();
            dealerHand.push(neueKarte);
            dealerWert = handWert(dealerHand);
        }
        anzeigenHand([spielerHand.join(", ") + ` (Gesamtwert: ${spielerWert})`, dealerHand.join(", ") + ` (Gesamtwert: ${dealerWert})`]);
 
        if (spielerWert === 21 && spielerHand.length === 2) {
            console.log(`\n${spielerName.name} hat Blackjack!`);
        } else if (dealerWert === 21 && dealerHand.length === 2) {
			console.log(`\nDealer hat Blackjack!`);
		} else {
            if (spielerWert > 21 && dealerWert <= 21) {
                console.log(`\n${spielerName.name} bust! Dealer gewinnt.`);
            } else if (dealerWert > 21 && spielerWert <= 21) {
                console.log(`\nDealer bust! ${spielerName.name} gewinnt.`);
            } else if (spielerWert === dealerWert || (spielerWert > 21 && dealerWert > 21)) {
                console.log("\nUnentschieden!");
            } else if (spielerWert > dealerWert) {
                console.log(`\n${spielerName.name}, du gewinnst mit ${spielerWert}.`);
            } else {
                console.log(`\nDealer gewinnt mit ${dealerWert}.`);
            }
        }
 
        const antwort = await inquirer.prompt([
            {
                type: 'list',
                name: 'weiter',
                message: `Möchtest du eine weitere Runde spielen, ${spielerName.name}?`,
                choices: ['Ja', 'Nein']
            }
        ]);
        weiterspielen = antwort.weiter === 'Ja';
        if (weiterspielen) {
            console.clear();
        }
    }
    console.log(`Danke fürs Spielen, ${spielerName.name}!`);
}
 
blackjackSpiel();