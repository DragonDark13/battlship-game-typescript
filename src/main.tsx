import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import set = Reflect.set;

const messages = {
    init: "Drag your ships to the map.",
    start: "Please click start to proceed",
    "your turn": "Your turn! Find and destroy all five enemy ships",
    won: "You won!!",
    lost: "Tough luck!! Computer won!",
    hit: "Boom, enemy ship is hit",
    miss: "Oops, nothing there",
    "already hit": "This cell is already hit. Try a new target",
    computer: "Computer thinking...",
    "computer hit": "Computer hit your ship",
    "computer miss": "Computer missed",
    destroyer: "A destroyer is sunk!",
    submarine: "A submarine is sunk!",
    cruiser: "A cruiser is sunk!",
    battleship: "A battleship is sunk!",
    career: "A career is sunk!",
};

const checkSunkShip = (shipType: string) => {
    const size = allShips.find(ship => ship.name === shipType)!.size

    const sunkSize = turn === "player" ?
        playerHits.filter(hit => hit === shipType).length :
        computerHits.filter(hit => hit === shipType).length;

    if (size === sunkSize) {
        turn === "player" ?
            playerSunkShips.push(shipType) :
            computerSunkShips.push(shipType)
        return true
    }
    return false
}

const messageContainer = document.getElementById("message") as HTMLElement;
const changeMessage = (newText: string) => {
    messageContainer.style.opacity = "0";

    setTimeout(() => {
        messageContainer.innerHTML = newText;
        messageContainer.style.opacity = "1";
    }, 250);
};
changeMessage(messages.init);
// Rotate options
let isFlipped = false;
const rotate = () => {
    const shipsHolder = document.getElementById("ships")!;
    const ships = [...shipsHolder.children] as HTMLElement[];

    if (!isFlipped) {
        ships.forEach((ship) => ship.classList.add("rotated"));
    } else {
        ships.forEach((ship) => ship.classList.remove("rotated"));
    }
    isFlipped = !isFlipped;
};
document.getElementById("rotate")!.addEventListener("click", rotate);

const createGrid = (element: HTMLElement) => {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = `cell-${i}`;
        element.append(cell);
    }
};
const playerBoard = document.getElementById("player")!;
createGrid(playerBoard);
const computerBoard = document.getElementById("computer")!;
createGrid(computerBoard);

class Ship {
    name: string;
    size: number;

    constructor(_name: string, _size: number) {
        this.name = _name;
        this.size = _size;
    }
}

const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 3);
const battleship = new Ship("battleship", 4);
const career = new Ship("career", 5);

const allShips = [destroyer, submarine, cruiser, battleship, career];

const getShipCells = (
    size: number,
    x: number,
    y: number,
    isFlipped: boolean,
    player: string
) => {
    const board = player === "computer" ? computerBoard : playerBoard;

    const cells = Array.from(
        board.getElementsByClassName("cell")
    ) as HTMLElement[];

    const spots = new Array(size)
        .fill(-1)
        .map((_, i) => {
            if (isFlipped) {
                return x * 10 + y + i * 10;
            } else {
                return x * 10 + y + i;
            }
        })
        .map((i) => cells[i]);
    return spots;
};


const addShipToGrid = (ship: Ship) => {

    while (true) {
        const isFlipped = Math.random() < 0.5;
        const x = isFlipped ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * (10 - ship.size))
        const y = isFlipped ? Math.floor(Math.random() * (10 - ship.size)) : Math.floor(Math.random() * 10)

        const spots = getShipCells(ship.size, x, y, isFlipped, "computer");
        if (spots.every(spot => spot !== undefined)) {
            if (spots.every((spot) => (!spot.classList.contains('taken') && true))) {
                spots.forEach((spot) => spot.classList.add('taken', ship.name))
                break
            }
        }

    }

}
allShips.forEach(ship => addShipToGrid(ship))

const ships = Array.from(document.querySelectorAll("#ships div")) as HTMLElement[]

const onDragStart = (e: MouseEvent) => {
    draggingShip = (e.target as HTMLElement).classList[0]
}

const myCells = Array.from(playerBoard.getElementsByClassName("cell") as HTMLElement[])
const computerCells = Array.from(
    computerBoard.getElementsByClassName("cell") as HTMLElement[]
)

const draggableShips = Array.from(
    document.querySelectorAll("#ships div")
) as HTMLElement[];

const checkValidTarget = (id: number) => {
    const size = allShips.find(ship => ship.name === draggingShip)?.size || 0;
    const x = Math.floor(id / 10)
    const y = id - x * 10;


    const cells = getShipCells(size, x, y, isFlipped, "player")

    if (cells.some(cell => cell && cell.classList.contains('taken')))
        return false;

    if (!isFlipped) {
        if (size + y > 10) return false;
        return true;
    } else {
        if (size + x > 10) return false;
        return true;
    }
}
const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    const targetId = (e.target as HTMLElement).id;
    const id = Number(targetId.split('cell-')[1])
    const isValidDrop = checkValidTarget(id)

    if (isValidDrop) {
        highlightCells(id)
    }
}

const onDragLeave = (e: DragEvent) => {
    myCells.forEach(cell => cell.classList.remove('highlight'))
}


const highlightCells = (id: number) => {
    const size = allShips.find((ship) => ship.name === draggingShip)?.size || 0
    const x = Math.floor(id / 10)
    const y = id - x * 10;

    const validCells = getShipCells(size, x, y, isFlipped, "player");
    console.log("validCells", validCells);
    validCells.forEach((cell) => cell.classList.add("highlight"))
}

let draggingShip = '';

const onDrop = (e: DragEvent) => {
    console.log(e.target);
    e.preventDefault()

    const highlightedCell = myCells.filter((cell) =>
        cell.classList.contains('highlight')
    );

    if (highlightedCell.length === 0) return;

    myCells.forEach(cell => {
        if (cell.classList.contains('highlight')) {
            cell.classList.remove('highlight');
            cell.classList.add('taken');
            cell.classList.add(draggingShip);
        }
    })

    const index = draggableShips.findIndex(ship => ship.classList.contains(draggingShip))

    if (index != -1) {

        draggableShips[index].remove()
        draggableShips.splice(index, 1)
    }

    console.log(draggingShip)

    if (draggableShips.length === 0) {
        document.getElementById('rotate')?.removeEventListener("click", rotate)
        document.getElementById('rotate')?.setAttribute('disabled', 'true');
        document.getElementById('start')?.removeAttribute('disabled');
        changeMessage(messages.start)
    }
}


let gameOver = false;
let turn: "computer" | "player" = 'computer';
const playerHits: string[] = [];
const computerHits: string[] = [];

const playerSunkShips: string[] = [];
const computerSunkShips: string[] = [];
const startGame = () => {
    turn = "player"
    computerCells.forEach(cell => cell.addEventListener('click', handlePlayerClick))

    document.getElementById("start")?.setAttribute("disabled", "true")
    changeMessage(messages["your turn"])
}

document.getElementById('start')?.addEventListener('click', startGame)
myCells.forEach(cell => {
    cell.addEventListener("dragover", onDragOver)
    cell.addEventListener("dragleave", onDragLeave)
    cell.addEventListener("drop", onDrop)
})


const checkGameOver = () => {
    if (playerSunkShips.length === 5) {
        changeMessage(messages.won);
        gameOver = true;
        return;
    }
    if (computerSunkShips.length === 5) {
        changeMessage(messages.lost);
        gameOver = true;
        return;
    }
};

const getPriorityTargets = () => {
    const hits = myCells.filter(cell => cell.classList.contains('hit')).filter(cell => {
        const shipRegex = /cell taken (.+?) hit/
        const match = cell.classList.toString().match(shipRegex)
        const ship = match?.[1] || ''
        return !computerSunkShips.includes(ship)
    })

    const candidateIDs = new Set();
    hits.forEach(cell => {
        const id = Number(cell.id.split("cell-")[1]);
        if (id % 10 !== 0) candidateIDs.add(id - 1)
        if (id % 10 !== 9) candidateIDs.add(id + 1)
        if (id>9) candidateIDs.add(id - 1)
        if (id <90>) candidateIDs.add(id - 1)
    })
}

const computerTurn = () => {
    checkGameOver();

    if (gameOver) return;
    changeMessage(messages.computer);


    setTimeout(() => {
        const validTarget = myCells.filter(
            (cell) => !cell.classList.contains("hit") && !cell.classList.contains("miss")
        )
        const target = validTarget[Math.floor(Math.random() * validTarget.length)]

        if (target.classList.contains("taken")) {
            const shipType = target.classList.toString().split("cell taken ")[1]
            computerHits.push(shipType)
            changeMessage(messages["computer hit"])
            target.classList.add('hit');
        } else {
            changeMessage(messages["computer miss"])
            target.classList.add('miss')
        }
    }, 1000)

    setTimeout(() => {
        checkGameOver();

        if (gameOver) return
        changeMessage(messages["your turn"])
        turn = "player"
    }, 2000)


}
const handlePlayerClick = (e: MouseEvent) => {
    if (gameOver) return;

    if (turn === "player") {
        const target = e.target as HTMLElement;
        if (target.classList.contains("hit") || target.classList.contains('miss')) {
            changeMessage(messages["already hit"])
            return;
        }
        if (target.classList.contains("taken")) {
            const shipType = target.classList.toString().split("cell taken ")[1]
            playerHits.push(shipType)
            target.classList.add('hit')
            changeMessage(messages.hit)

            if (checkSunkShip(shipType)) {
                changeMessage(messages[shipType as keyof typeof messages])
            } else {
                changeMessage(messages.hit)
            }
        } else {
            changeMessage(messages.miss)

            target.classList.add('miss')
        }

        turn = "computer";
        setTimeout(computerTurn, 1000)
    }

    console.log(playerHits);
}


ships.forEach(ship => ship.addEventListener("mousedown", onDragStart))
// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
