import * as server from '@minecraft/server';
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import * as warp from "./warp.js";

const prefix = '!';

server.world.beforeEvents.chatSend.subscribe(messageEvent => {
    const player = messageEvent.sender;
    const input = messageEvent.message;

    if (input.startsWith(prefix)) {
        messageEvent.cancel = true;

        const command = input.split(' ')[0];

        switch (command) {
            case `${prefix}sethome`:
                warp.handleSetHome(player, input);
                break;
            case `${prefix}home`:
                warp.handleTeleportHome(player, input);
                break;
            case `${prefix}delhome`:
                warp.handleRemoveHome(player, input);
                break;
            case `${prefix}homes`:
                warp.listHomes(player);
                break;
            case `${prefix}sit`:
                player.runCommandAsync(`playsound note.bell @s`);
                player.runCommandAsync(`function sit`);
                break;
            case `${prefix}spawn`:
                warp.handleSpawn(player);
                break;
            case `${prefix}back`:
                warp.teleportTempPosition(player);
                player.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7You have been teleported to your previous location.");
                player.runCommandAsync(`playsound note.bell @s`);
                break;
            case `${prefix}die`:
                player.runCommandAsync(`kill @s`);
                player.sendMessage("§7» You killed yourself");
                player.runCommandAsync(`playsound note.bell @s`);
                break;
            case `${prefix}xy`:
                player.runCommandAsync(`effect @s night_vision 9999 255 true`);
                player.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7Tite ni xyrro maliit");
                break;
            case `${prefix}faction`:
                player.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7Faction Menu is opening in 3 seconds Please close chat");
                player.runCommandAsync(`playsound note.bell @s`);
                server.system.runTimeout(() => {
                    faction(player); // ui menu
                }, 60);
                break;
            case `${prefix}fire`:
                server.system.run(() =>  {
                    player.setOnFire(3, true);
                });
                break;
            default:
                player.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7Unknown Command");
                break;
        }
    } else {
        messageEvent.cancel = true;

        if (!player.hasTag("muted")) {
            server.world.sendMessage(`${handlePlayerName(player) §7» ${input}`);
            // player.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§r${chatClan}§r §r§8[§r${chatRank.join("§r§8] [§r")}§r§8] §7${player.name}§r §7» ${messageEvent.message}"}]}`);
        }
    }
});

function handlePlayerName(player) {
    let chatRank = player.getTags().filter(t => t.startsWith("rank:")).map(e => e.slice(5));
    chatRank = chatRank.length ? chatRank : ["§7member"];

    let chatClan = player.getTags().find(t => t.startsWith("clan:"));
    chatClan = chatClan ? chatClan.slice(5) : "§5Solo";

    let nameDisplay = `§r${chatClan}§r §8[§r${chatRank.join("§r§8][§r")}§r§8] §7${player.name}§r`;
    
    return nameDisplay;
}

server.system.run(function tick() {
    for (let player of server.world.getPlayers()) {
        // Set player's name tag using the result of handlePlayerName function
        player.nameTag = handlePlayerName(player);
    }

    // Schedule the next tick
    server.system.run(tick);
});


function managePlayerClanTags(player) {
    // Filter out all tags that start with "clan:"
    const clanTags = player.getTags().filter(tag => tag.startsWith("clan:"));

    if (clanTags.length > 1) {
        // If more than one clan tag is found, remove all but the first one
        for (let i = 1; i < clanTags.length; i++) {
            player.removeTag(clanTags[i]);
        }
    }
}

server.world.afterEvents.entityHurt.subscribe(data => {
    if (data.damageSource?.damagingEntity?.typeId == "minecraft:player" && data.damageSource?.damagingProjectile?.typeId == "minecraft:arrow") {
        data.damageSource.damagingEntity.playSound("random.orb");
    }

    // if ()
});

server.world.afterEvents.entityDie.subscribe(async data => {
    const attacker = data.damageSource.damagingEntity;
    const victim = data.deadEntity;

    if (attacker instanceof server.Player && victim instanceof server.Player) {
        if (attacker !== victim) {
            attacker.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7You killed a player!");
            victim.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7You were killed by a player.");
            try {
                attacker.playSound("note.bell");
                await attacker.runCommandAsync(`scoreboard players add @s playerKills 1`);
            } catch (e) {
                attacker.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7Failed to update scoreboard.");
            }
        } else {
            victim.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7You killed yourself.");
        }
    }

    const { x, y, z } = victim.location;
    if (victim instanceof server.Player) victim.sendMessage(`§l§f§kii§r §l§cDEATH§fCOORDS §r§f» §7Last Location: ${Math.floor(x)}, ${Math.floor(y)}, ${Math.floor(z)}`);
});



function faction(player) {
    let form = new ActionFormData()
        .title("§g§r§5SENDARIA§fSMP")
        .body("Select your faction")
        .button("§l§3TEMPEST\n§fKNIGHT", "textures/ui/5")
        .button("§l§cFLAME\n§fONI", "textures/ui/6")
        .button("§l§aFOREST\n§fSPIRIT", "textures/ui/7")
        .button("§l§gDRAGON'S\n§fFANG", "textures/ui/8")
        .button("§l§4EXIT\n§fMENU");

    form.show(player).then(response => {
        switch (response.selection) {
            case 0:
                player.runCommandAsync(`playsound note.bell @s`);
                factionDisplay(player, "TEMPEST KNIGHT");
                break;
            
            case 1:
                player.runCommandAsync(`playsound note.bell @s`);
                factionDisplay(player, "FLAME ONI");
                break;
            
            case 2:
                player.runCommandAsync(`playsound note.bell @s`);
                factionDisplay(player, "FOREST SPIRIT");
                break;
            
            case 3:
                player.runCommandAsync(`playsound note.bell @s`);
                factionDisplay(player, "DRAGON'S FANG");
                break;
            
            case 4:
                // Handle the "EXIT MENU" option if needed
                player.sendMessage("§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7Exiting faction menu.");
                break;
        }
    }).catch(error => {
        player.sendMessage(`§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7Error displaying form: ${error.message}`);
    });
}

const factionPerks = {
    "TEMPEST KNIGHT": `
        §l§3TEMPEST §fKNIGHT§r
        §fPerks:
        §7- High melee damage
        §7- Haste
    `,
    "FLAME ONI": `
        §l§cFLAME §fONI§r
        §fPerks:
        §7- Fire aspect damage
        §7- Heat resistance
    `,
    "FOREST SPIRIT": `
        §l§aFOREST §fSPIRIT§r
        §fPerks:
        §7- Enhanced agility
        §7- Nature healing ability
    `,
    "DRAGON'S FANG": `
        §l§gDRAGON'S §fFANG§r
        §fPerks:
        §7- Permanent Elytra
        §7- Toughness
    `
};


// Function to display the selected faction
function factionDisplay(player, faction) {
    if (factionPerks[faction]) {
        player.sendMessage(`§l§f§kii§r §l§5SENDARIA§fSMP §r§f» §7Faction Info Preview: ${faction}\n${factionPerks[faction]}`);
    } else { return; }
    
    
}