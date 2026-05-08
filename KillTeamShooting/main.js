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
            "q": "Is the shooting model on \"Vantage\" terrain relative to the target?",
            "a": [
                ["Yes: 2\" above target", (ctx) => { ctx.set("vantage", 2); return "check_intervening_terrain"; }],
                ["Yes: 4\" above target", (ctx) => { ctx.set("vantage", 4); return "check_intervening_terrain"; }],
                ["No", "check_vantage_defender"],
            ]
        },
        "check_vantage_defender": {
            "q": "Is the target on \"Vantage\" terrain relative to the shooting model?",
            "a": [
                ["Yes", (ctx) => { ctx.set("defenderVantage", true); return "check_intervening_terrain"; }],
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
                ["Yes: Light", (ctx) => { ctx.set("cover", "Light"); return "check_concealed"; }],
                ["Yes: Heavy", (ctx) => { ctx.set("cover", "Heavy"); return "check_concealed"; }],
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
                ["Yes", (ctx) => {
                    if (ctx.vantage) return "check_connected_heavy_terrain_shooter";
                    if (ctx.defenderVantage) return "check_connected_heavy_terrain_defender";
                    return resolveObscuredShot(ctx);
                }],
                ["No", resolveUnimpededShot]
            ],
        },
        "check_connected_heavy_terrain_shooter": {
            "q": "Is the \"Heavy\" terrain connected to the shooter's \"Vantage\" terrain feature?",
            "a": [
                ["Yes", resolveUnimpededShot],
                ["No", resolveObscuredShot]
            ]
        },
        "check_connected_heavy_terrain_defender": {
            "q": "Is the \"Heavy\" terrain connected to the targets's \"Vantage\" terrain feature?",
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
            _history: [[]],
            set: function (key, value) {
                this._history.at(-1).unshift([key, this[key]])
                this[key] = value;
                return this;
            },
            undo: function () {
                const last = this._history.pop();
                for (const [key, value] of last) {
                    this[key] = value;
                }
            },
            newEpoch: function () {
                this._history.push([]);
            }
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

    function buildAnswersFromContext() {
        context.answersElement.innerHTML = "";

        (context.question.a || []).forEach(([ans, next]) => {
            const answerElement = document.createElement("button");
            answerElement.textContent = ans;
            answerElement.classList.add("answer");
            answerElement.addEventListener("click", () => {
                answer(ans, next);
            });

            context.answersElement.appendChild(answerElement);
        });

        if (context.question.a) {
            context.answersElement.appendChild(document.createElement("br"));
        }

        if (context._history.length > 1) {
            const _undo = document.createElement("button");
            _undo.textContent = "Undo";
            _undo.classList.add("answer");
            _undo.addEventListener("click", undo);
            context.answersElement.appendChild(_undo);
        }

        const _reset = document.createElement("button");
        _reset.textContent = "Reset";
        _reset.classList.add("answer");
        _reset.addEventListener("click", reset);
        context.answersElement.appendChild(_reset);
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

        container.appendChild(questionElement);
        container.appendChild(answersElement);
        document.getElementById("questions").appendChild(container);

        if (!q.a) {
            questionElement.classList.add("final");
        }

        context.set("question", q)
               .set("containerElement", container)
               .set("answersElement", answersElement);

        buildAnswersFromContext();
    }

    function answer(ans, next) {
        const text = document.createElement("span");
        text.textContent = ans;
        context.answersElement.innerHTML = "";
        context.answersElement.appendChild(text);

        context.newEpoch();
        if (typeof next === "function") next = next(context);
        ask(next);
    }

    function undo() {
        context.containerElement.parentNode.removeChild(context.containerElement)
        context.undo();
        buildAnswersFromContext();
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