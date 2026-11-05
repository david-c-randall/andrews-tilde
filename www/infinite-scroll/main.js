import { supabase } from "../supabase.js";

const container = document.getElementById("container");
const scoreBox = document.getElementById("score-box")

const POIs = {
    22: "Chandra Bahadur Dangi from Nepal was only 21.5 inches tall",
    68: "This is how tall I am (on a good day)",
    107: "The tallest person, Robert Wadlow, was this tall",
    120: "You've reached 10 feet",
    600: "This is 50 feet! Wow",
    63360: "A full mile! I'm impressed"
}

const { data: {user} } = await supabase.auth.getUser();
let distance = 0;
let score = parseInt(localStorage.getItem("score")) || 0;

async function main() {
    // Get the stored score if the user is logged in
    if (user) {
        scoreBox.innerHTML = "Fetching Score...";
        const { data, error } = await supabase
            .from("scroller-score")
            .select("score")
            .eq("id", user.id)
            .maybeSingle();
        if (data && typeof data.score === "number") {
            score = data.score;
        }
    }

    // Initializes chunks to fill twice the entire height of the window 
    do {
    AddChunk();
    } while (2 * document.documentElement.clientHeight > document.documentElement.scrollHeight);
    UpdateScoreDisplay();

    // Adds chunks if the user scrolls close to the bottom of the page
    window.addEventListener("scroll", () => {
        if (
            document.documentElement.scrollTop +
            (2 * document.documentElement.clientHeight) >=
            document.documentElement.scrollHeight
        ) {
            AddChunk();
        }
    });
}

// Loads the infinite elements as the user scrolls
function AddChunk() {
    for (let i = 0; i < 10; i++) {
        const block = document.createElement("div");
        block.className = "inch";
        block.innerHTML = `${Math.floor(distance / 12)}'${distance % 12}"`;
        if (Object.keys(POIs).includes(distance.toString())) {
            block.innerHTML += ` ${POIs[distance]}`;
            console.log("woah it worked")
        }

        // Gives a chance to make a shiny for every element loaded
        if ((Math.random() * 4096) > 4095) {
            block.classList.add("shiny", "clickable");
            console.log("shiny");
            block.addEventListener("click", async () => {
                if (block.classList.contains("clickable")) {
                    block.classList.remove("clickable")
                    await IncrementScore();
                    UpdateScoreDisplay();
                }
            });
        }
        container.appendChild(block);
        distance++;
    }
}

// Increases the user's score 
function UpdateScoreDisplay() {
    scoreBox.innerHTML = `Score: ${score}`;
    localStorage.setItem("score", score);
}

async function IncrementScore() {
    if (!user) {
        score++;
    } else {
        // Run supabase function to increment score if a user is logged in
        const { data: newScore, error } = await supabase.rpc("scroller_increment_score", {
            user_id: user.id,
        });

        if (error) {
            console.error("Failed to increment score:", error.message);
            score++;
        } else {
            score = newScore;
        }
    }
}

main();