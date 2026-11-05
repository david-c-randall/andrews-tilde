import { supabase } from "../supabase.js";

const container = document.getElementById("container");
const scoreBox = document.getElementById("score-box")

const POIs = {
    12: "One foot... Let's be real this was probably almost on the page when it loaded in",
    22: "Chandra Bahadur Dangi from Nepal was only 21.5 inches tall",
    68: "This is how tall I am (on a good day)",
    107: "The tallest person, Robert Wadlow, was this tall",
    120: "You've reached 10 feet",
    314: "What",
    315: "if",
    316: "I",
    317: "write",
    318: "in",
    319: "every",
    320: "box?",
    325: "Not a fan? Ok :(",
    600: "This is 50 feet! Wow",
    1200: "100 feet! Oh yeah",
    3661: "The statue of Liberty (and its pedestal) are 305 feet 1 inch tall",
    3768: "Happy pi day (every day is pi day)",
    4096: "Hypothetically you should have about 1 shiny by this point. At least you know if you're unlucky now...",
    4320: "You could've run a whole football field at this point if you were willing to touch grass",
    12000: "1000 feet, pretty far if I do say so myself",
    31415: "Old username alert, back in the good ol' days you could get away with fun usernames. Now they say It HaS tO bE pRoFeSsIoNaL",
    31680: "Half mile mark. At some point you have to start asking yourself if you have better things to do with your life",
    32604: "It's over half a mile, and this is the height of the Burj Khalifa, the world's tallest building",
    60000: "5000 feet, but you're not this far for this milestone, are you?",
    63360: "A full mile! I'm impressed. I don't want your day to be wasted so no more messages after this one ;)"
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
            block.style.backgroundColor = "lightblue";
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