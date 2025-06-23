import { Enemy } from "@/models/Enemy";

const TestPage = () => {
    const enemy = new Enemy("Ophelia", 8, "Sibling Student turned traitor by romancing the enemy.");

    enemy.escalate(2);

    return (
        <div>
            <h1>Enemy Test</h1>
            <p>{enemy.roast()}</p>
        </div>
    );
};

export default TestPage;