"use strict";
(() => {
    const questions = {
        "start": {
            "q": "Can you draw a clear line of sight from the head of your model to any part of the target model?",
            "a": [
                ["Yes", "check_vantage"],
                ["No", "invalid_target"]
            ]
        },
        "check_vantage": {
            "q": "Is the shooting model on \"Vantage\" terrain?",
            "a": [
                ["Yes: 2\" above target", (ctx) => { ctx.vantage = 2; return "check_intervening_terrain"; }],
                ["Yes: 4\" above target", (ctx) => { ctx.vantage = 4; return "check_intervening_terrain"; }],
                ["No", "check_intervening_terrain"]
            ]
        },
        "check_intervening_terrain": {
            "q": "Can you draw a clear line of sight from any point on the shooting model's base to all of the target model's base (not counting terrain within 1\" of the shooting model)?",
            "a": [
                ["Yes", resolveUnimpededShot],
                ["No", "check_cover"]
            ]
        },
        "check_cover": {
            "q": "Is the intervening terrain within 1\" of the target model?",
            "a": [
                ["Yes: Light", (ctx) => { ctx.cover = "Light"; return "check_concealed"; }],
                ["Yes: Heavy", (ctx) => { ctx.cover = "Heavy"; return "check_concealed"; }],
                ["No", (ctx) => "check_obscured"]
            ]
        },
        "check_concealed": {
            "q": "Does the target have a \"Conceal\" order?",
            "a": [
                ["Yes", (ctx) => (ctx.vantage && ctx.cover === "Light") ? "shoot_vantage_concealed" : "invalid_target"],
                ["No", (ctx) => ctx.cover === "Heavy" ? "check_cover_and_obscured" : resolveCoverShot(ctx)]
            ]
        },
        "check_cover_and_obscured": {
            "q": "Do any sight lines from the shooter pass through the same terrain piece more that 1\" from the defender (not counting terrain that's connected to the \"Vantage\" terrain peice)?",
            "a": [
                ["Yes", "check_defenders_choice"],
                ["No", resolveCoverShot]
            ]
        },
        "check_defenders_choice": {
            "q": "Does the defender want to benefit from cover or obscured (obscured is normally better)?",
            "a": [
                ["Cover", resolveCoverShot],
                ["Obscured", resolveObscuredShot]
            ]
        },
        "check_obscured": {
            "q": "Is the intervening terrain \"Heavy\"?",
            "a": [
                ["Yes", (ctx) => ctx.vantage ? "check_connected_heavy_terrain" : resolveObscuredShot(ctx)],
                ["No", resolveUnimpededShot]
            ],
        },
        "check_connected_heavy_terrain": {
            "q": "Is the \"Heavy\" terrain connected to the shooter's \"Vantage\" terrain feature?",
            "a": [
                ["Yes", resolveUnimpededShot],
                ["No", resolveObscuredShot]
            ]
        },
        "shoot_normal": {
            "q": "You can shoot at the target without any restrictions."
        },
        "shoot_cover": {
            "q": "You can shoot at the target, but the defender can retain one defence die as a normal success (cover save)."
        },
        "shoot_obscured": {
            "q": "You can shoot at the target, but must discard one success and treat all critical success rolls as normal success rolls (obscured)."
        },
        "shoot_vantage_2": {
            "q": "You can shoot at the target and retain one of your attack dice as a normal success (Accurate 1)."
        },
        "shoot_vantage_4": {
            "q": "You can shoot at the target and retain two of your attack dice as normal successes (Accurate 2)."
        },
        "shoot_vantage_cover_2": {
            "q": "You can shoot at the target and retain one of your attack dice as a normal success (Accurate 1) and the defender can retain one defence die as a normal success (cover save)."
        },
        "shoot_vantage_cover_4": {
            "q": "You can shoot at the target and retain two of your attack dice as normal successes (Accurate 2) and the defender can retain one defence die as a normal success (cover save)."
        },
        "shoot_vantage_concealed": {
            "q": "You can shoot at the target, but the defender can either retain one defence die as a critical success or two dice as normal successes (concealed cover save)."
        },
        "shoot_vantage_obscured_2": {
            "q": "You can shoot at the target and retain one of your attack dice as a normal success (Accurate 1), but must discard one success and treat all critical success rolls as normal success rolls (obscured)."
        },
        "shoot_vantage_obscured_4": {
            "q": "You can shoot at the target and retain two of your attack dice as normal successes (Accurate 2), but must discard one success and treat all critical rolls as normal success rolls (obscured)."
        },
        "invalid_target": {
            "q": "You cannot shoot at the target."
        }
    }

    let context = null;

    function newContext() {
        return {

        };
    }

    function resolveUnimpededShot(ctx) {
        if (ctx.vantage === 2) {
            return "shoot_vantage_2";
        } else if (ctx.vantage === 4) {
            return "shoot_vantage_4";
        }
        return "shoot_normal";
    }

    function resolveCoverShot(ctx) {
        if (ctx.vantage === 2) {
            return "shoot_vantage_cover_2";
        } else if (ctx.vantage === 4) {
            return "shoot_vantage_cover_4";
        }
        return "shoot_cover";
    }

    function resolveObscuredShot(ctx) {
        if (ctx.vantage === 2) {
            return "shoot_vantage_obscured_2";
        } else if (ctx.vantage === 4) {
            return "shoot_vantage_obscured_4";
        }
        return "shoot_obscured";
    }

    function ask(question) {
        const q = questions[question];
        const container = document.createElement("div");
        container.classList.add("question");
        const questionElement = document.createElement("div");
        questionElement.textContent = q.q;
        questionElement.classList.add("questionText");
        const answersElement = document.createElement("div");
        answersElement.classList.add("answers");

        (q.a || []).forEach(([ans, next]) => {
            const answerElement = document.createElement("button");
            answerElement.textContent = ans;
            answerElement.classList.add("answer");
            answersElement.appendChild(answerElement);
            answerElement.addEventListener("click", () => {
                answer(ans, next, answersElement);
            });
        });

        const _reset = document.createElement("button");
        _reset.textContent = "Reset";
        _reset.classList.add("answer");
        _reset.addEventListener("click", reset);
        answersElement.appendChild(_reset);

        container.appendChild(questionElement);
        container.appendChild(answersElement);
        document.getElementById("questions").appendChild(container);;
    }

    function answer(ans, next, targetElement) {
        targetElement.textContent = ans;
        if (typeof next === "function") next = next(context);
        ask(next);
    }

    function reset() {
        document.getElementById("questions").innerHTML = "";
        context = newContext();
        ask("start");
    }

    function main() {
        reset();
    }

    window.onload = main;
})()