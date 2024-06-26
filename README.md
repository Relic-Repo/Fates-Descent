![GitHub Latest Version](https://img.shields.io/github/v/tag/Relic-Repo/Fates-Descent?label=version)

<html lang="en">

<body>
<h1 align="center">Fate's Descent</h1>
    <p align="center">
        <a href="https://drive.google.com/uc?export=view&id=1CUZdvqMfdNQXYMIAf77P6i4xzI3KXcPG">
            <img src="https://drive.google.com/uc?export=view&id=1CUZdvqMfdNQXYMIAf77P6i4xzI3KXcPG" style="width: 1280px; max-width: 100%; height: auto;" title="Fate's Descent Banner" />
        </a>
    </p>
    <br>
    <h2>Description</h2>
        <div align="center" style="margin: 0 auto; padding: 20px;">
            <strong><b>Fate's Descent</b></strong> is a dynamic and immersive module designed for Foundry Virtual Tabletop, enhancing gameplay by introducing a comprehensive system of sanity and madness mechanics. The module meticulously tracks sanity points and introduces various levels of madness, each with unique effects that influence character behavior and abilities. Players can experience short-term and long-term madness, with effects ranging from mild disturbances to severe, mind-altering conditions. The module integrates seamlessly with character sheets, providing visual indicators for sanity and madness levels, and automates the application of effects through interactive dialogs and rollable tables. Fate's Descent elevates the role-playing experience, adding depth and complexity to character development and storytelling. With robust settings for customization, game masters can tailor the madness mechanics to fit their campaign's tone and intensity, ensuring an engaging and challenging adventure for all participants.
        </div>
    <h2>How to Use</h2>
        <h3>Installation</h3>
            <p>
                <dl>
                    <dd>Use the Foundry VTT installer with the manifest link or you may copy the link of the module.json from the latest release.</dd>
                </dl>
            </p>
        <h3>Required Modules</h3>
            <p>
                <ul>
                    <li><a href="https://foundryvtt.com/packages/midi-qol">Midi-QoL</a></li>
                    <li><a href="https://foundryvtt.com/packages/dae/">D.A.E.</a></li>
                    <li><a href="https://foundryvtt.com/packages/socketlib">socketlib</a></li>
                </ul>
            </p>    
        <h3>Fate's Descent: Expanding the D&D5e System with Sanity and Madness</h3>
            <p>
                <dl>
                    <dd>Fate's Descent introduces two new metrics to the D&D5e system, expanding the optional rules for Madness found in the Dungeon Master's Guide (DMG) on page 258.</dd>
                </dl>
            </p>
        <hr>
            <h4>Sanity Ability Score</h4>
            <p>
                <dl>
                    <dd>The D&D5e system has an optional rule and setting to activate the Sanity ability score.
                    </dd>
                </dl>
                <ul>
                    <li>Please be sure this option is activated. The module will not fucntion without it. You will be given a warning on screen if the Setting is detected as False.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=1f_rO8YvB1CFh1qunfnZjw5gLHBc_fndt" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                </ul>    
            </p>          
            <h4>Sanity Points</h4>
                <p>
                    <dl>
                        <dd>The first of these metrics is Sanity Points, which are akin to Hit Points but represent a character's mental fortitude. Sanity Points are recovered similarly to Hit Points using Hit Dice. During rest periods, players can choose to use some of their Hit Dice for Sanity Point recovery.
                        </dd>
                        <table align="center">
                            <tr>
                                <td>
                                <img src="https://drive.google.com/uc?export=view&id=12Kk2D9ydJBlguXLJ0O0LMy7GCRtJJd5b" alt="Short Rest Sanity" style="width: 300px; height: auto;" />
                                </td>
                                <td>
                                <img src="https://drive.google.com/uc?export=view&id=1AUWSkotw835LAMtPGc_EBF5-52WPD-eI" alt="Long Rest Sanity" style="width: 300px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <dd>By default, each character begins with an initial 28 Sanity Points, bolstered by their Sanity Modifier. These points do not increase with level, although customization by the Game Master (GM) is possible, and features may be added to increase this amount.
                        </dd>        
                        <dd>Maintaining a healthy amount of Sanity Points becomes imperative with the introduction of the second metric. As characters lose Sanity Points, Madness Points begin to accumulate if not "healed." The rate of accumulation increases as Sanity Points are further reduced.
                        </dd>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1-OKKacGlEnwvS-9G0lRH1J7Q1id_pQ72" alt="Actor sheet V2" style="width: 210px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1DRbt81TEzF7nKbYZOqZR-xWa5lD_mj_u" alt="Actor Sheet" style="width: 395px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1stMIIB_8mMnWs61t9d3_EWTlfvp8bCou" alt="tidySheet" style="width: 395px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                    </dl>    
                </p>
            <hr>
            <h4>Madness Points</h4>
                <p>
                    <dl>
                        <dd>The second metric, Madness Points, represents the effects of sanity damage. Every character starts with 10 maximum Madness Points limit, by default, plus their Sanity Modifier, which serves a dual purpose: increasing capacity and providing an early-stage buffer against the effects of accumulated Madness.
                        </dd>
                    </dl>
                </p>
            <hr>
            <h4>Phases of Madness</h4>
                <p>
                    <dl>
                        <dd>Madness progresses through five phases, ranging from mild inconvenience to the character becoming an NPC at the final phase. These phases are evenly spaced across the Madness Points, with the final phase at the very end.
                        </dd>
                    </dl>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=127DIXB1nHm7ShWrE1-CntFNGYEVsEvKk" alt="Disturbance" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=15bQIuANAs4G2CNkEsqngj3N9ZbxgeMVx" alt="Disorientation" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1rFVUWlv7-6jlKraK-lR0LNKEVDnNx6Lf" alt="Delirium" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1c5iuHZhBiZS6t7JuquWTeFJOkGi8Lfvv" alt="Cataclysm" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=12aZGIX2HouqvmyhaO68GBz78-j7U_v3S" alt="Oblivion" style="width: 200px; height: auto;" />
                                </td>
                            </tr>
                        </table>    
                </p>
            <hr>
            <h4>Reducing Madness Points</h4>
                <p>
                    <dl>
                        <dd>Currently, there are three ways to reduce Madness Points:</dd>
                    </dl>
                    <ul>
                        <li>Greater Restoration: This spell lowers a character's Madness Points by two levels (four points by default).
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1tqY3boFMch8pLae9CQ79NCtFiSiyE3Dq" alt="Stasis" style="width: 500px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <li>Short Term Madness Roll Table: Rolling voluntarily on this table imposes Insanity Effects lasting 1 to 10 minutes, reducing Madness Points by 1.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1uVwo7ih1cJuv_yoRe-QXDMWq7cQRWMAA" alt="Stasis" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1oCtCtmrGakXdenU5a7Mma9PNHjlJquOf" alt="Hysterical" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1_RSXo1h4Rf6x3Ak0isY5aEUPV5qAKU5y" alt="Frightened" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1IsFd0YjD37Y3d5P8RkonFP4Cg1n2zjHk" alt="Babbling" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1NL4r_lSZKs0iZvdX6dvnfKBTQuJpZPsP" alt="Maleficent" style="width: 200px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1QK35QJdjQOoFUCWZ2S0G-qXIlsmiDJbn" alt="Hallucinating" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=19hlEEDgG3kA9OtSdxXMEbTk6U5wOdFtW" alt="Compelled" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1AcsiEAO1b5EtG-MebBf6engi0GUXcIPx" alt="Ravenous" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1AIjl-b1nd9WWqctgUYDMmaGrfGUGf1gO" alt="Stunned" style="width: 200px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1toVOw0VHrXdOwuR84lIyzAZIIZHPrxDo" alt="Catatonic" style="width: 200px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <li>Long Term Madness Roll Table: Rolling voluntarily on this table imposes more severe Insanity Effects lasting 10 to 100 hours, reducing Madness Points by 3.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1elK-8l1xTAndQQGS0BoVmKqGKtuclMPp" alt="Compulsive" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1U49wqnz5ZQDk7oa2hVKdJEIaO7frr2OV" alt="Hallucinating" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1KJ6IWDJwELbaNRT0377xYX6TTCYwSoVV" alt="Paranoid" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1EgaysgnZlaVFhmurd54L1aqjQ6WWie6j" alt="Revulsion" style="width: 167px; height: auto;" />
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=17MGVNq_p1mXJ-aqJllKWK0Y5JruWF97o" alt="Delusional" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1cPG3SuGacgr6wgqoFSwSl0XvMMKa6mw4" alt="Charmed" style="width: 167px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1nB_iKZKSLeyI-wFnWTQMoTFLop0L06NX" alt="Imprisoned" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1od6x4rfAcDnnBLgK_D6AanFJop0kg4Vg" alt="Tremors" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1Z1h8D4WSWuVPSSplWUJKYmKCZbc-j2V7" alt="Amnesic" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1lUeQ6sYMX8YEBPhwLmjebRFgTIhSgTuO" alt="Confusion" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1shyx5EYyO3mmS8NKeFBENqSnbJ7H2XVT" alt="Silenced" style="width: 167px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1WsiZs726ffYIXWt7afnbL6ENGq7ZqixZ" alt="Catatonic" style="width: 167px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                    </ul>    
                </p>
                <h5>Presented with a Choice</h5>
                    <ul>
                        <li>Each time a character accumulates enough Madness Points to move into a new phase of madness, they will be given a choice: roll on the Short or Long Term Madness Tables and gain a Temporary Insanity to help reduce their Madness accumulation. They will also be informed of how many points the roll will reduce their Madness by. These values are adjustable but should generally correspond to half a phase for Short Term Madness and one and a half phases for Long Term Madness.</li>
                        <br>
                        <table align="center">   
                            <tr>
                                <td>
                                <img src="https://drive.google.com/uc?export=view&id=1sjZusZjA0YiJRytSThGvF14NzHA7HLpN" alt="Madness Rolltable" style="width: 500px; height: auto;" />
                                </td>
                            </tr>
                        </table>   
                        <li>First, the character will enter the new Madness Phase and be presented with the Roll Table option. Selecting Short Term will roll on the Short Term Madness Table, reduce their Madness Points, and if the reduction is sufficient, remove the Madness Phase.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1hwKUJlgUfQoIXS7VEZoTPSpTNlgS6J5b" alt="Imprisoned" style="width: 250px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1FJpQ_IZltxdqou0gSXNB9JcSFifbCTOL" alt="Tremors" style="width: 250px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1nkaLJ7PF7HbLouPgbHN2zmPLJ-AMr56U" alt="Amnesic" style="width: 250px; height: auto;" />
                                </td>
                        </table>
                        <li>Similarly, selecting Long Term will roll on the Long Term Madness Table, reduce their Madness Points, and at least lower the character by one Madness Phase.</li>
                    </ul>
            <hr>
            <h4>Sanity Damage Type</h4>
            <p>
                <dl>
                    <dd>The Fate's Descent module implements a new damage type in the game: Sanity. Any damage set to Sanity will automatically deduct from the target's Sanity Points.
                    </dd>
                </dl>
                <ul>
                    <li>You can apply the Sanity damage type in all cases as you would other damage types. This includes vulnerabilities, resistances, and Midi-QoL's Overtime Effects</li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=1AXRo_kjNMTjuZths2ZtV2ycQ3687p1dm" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                </ul>    
            </p>          
            <hr>
            <h4>The Sanity Roller</h4>
                <p>
                <dl>
                    <dd>This module has an integrated rolling app for the GM to use. It allows the GM to request rolls naturally and then set the DCs and/or loss amounts as the rolls come in.
                </dd>
                </dl>
                <ul>
                    <li>The First roller will initiate the Sanity Roller app.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=1A9nkEN_xF_9Y2Sc8PAJbqmbhECym26Tq" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                    <li>Any subsequent requests received will populate the currently open app.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=1cWiPus2N_0UfgOWseoYSSbOtTtFEF62X" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                    <li>If any character rolls the wrong type of Sanity Roll, the GM will be notified by a color change to the Name entry. A color key is provided to help quickly indicate these possible play errors.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=1q_2IE0sfJLsh_8DrevHEydEc_55r-hMy" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                    <li>Clicking on any of the names will switch their roll type, so correcting an incorrect roll is as simple as clicking the name and changing the roll type.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=12lotJU6B854Ay4ZlU_QE7Ick5nrGeDx2" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                    <li>The Sanity Roller will continue to expand to accommodate many requests.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=1lUGie_s0Ls1CW5MRg5HNE-JHBrhtTaCP" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                    <li>Making changes to the ALL row will set all requests currently populated on the Roller.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=18mEJsRGAZc1xdD3aVX7YU0fXBN43ox5Z" alt="Stasis" style="width: 500px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                    <li>"Rolling All" will roll all requests at their current set inputs. "Cancel All" will bypass the Sanity Roller inputs and process the rolls normally. The chat message outputs will state the Severity Level set, the DC value, and the Sanity Points lost or, if the roll was successful, state that Sanity was maintained.
                    </li>
                    <br>
                    <table align="center">
                        <tr>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=1_kLb9k_CWokGCdwUTc7o9mzWCNhz1eDg" alt="Stasis" style="width: 250px; height: auto;" />
                            </td>
                            <td>
                                <img src="https://drive.google.com/uc?export=view&id=16dUUMdWHfgxvUHab22OJUdX3NFxgA2wH" alt="Stasis" style="width: 250px; height: auto;" />
                            </td>
                        </tr>
                    </table>
                </ul>    
                </p>    
            <hr>
            <h4>Included Macros</h4>
                <p>
                    <dl>
                        <dd>There are currently six different macros included with the system.
                    </dd>
                    </dl>
                    <ul>
                        <li>You can find these macro's in the compendia and they all should be imported.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1iGtxtWHu9lzxg_k6GL837Hw0rzsp6dnI" alt="Stasis" style="width: 500px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <li>The first of these, "addHitDie," is a macro meant to be used with ItemMacro or equivalent. It will provide a consumable item the ability to add Hit Dice back to the character. This is meant to help supplement the use of Hit Dice and provide a way for more "comforting" things in your world to help "heal" those suffering from reduced Sanity. Characters can not gain additional Max Hit Dice from this, but can replenished what they have already used.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1ajCwcQOzxgXn06FzuuNBhH62_jcoYn39" alt="Stasis" style="width: 250px; height: auto;" />
                                </td>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1QMM9js8R4gM9baC6-bNJxd6kYdnlcdHT" alt="Stasis" style="width: 250px; height: auto;" />
                                </td> 
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1bdxDH6Bveksx17jd1zIPd4QOYKGyX5Aq" alt="Stasis" style="width: 250px; height: auto;" />
                                </td>     
                            </tr>
                        </table>
                        <li>The "Clear Sanity Requests" macro is for GM use and will empty the global storage of requests. This may be necessary if no Sanity Roller apps are loading when players are making requests.
                        </li>
                        <li>The "Madness Rolltable" macro is for player use and will present the player with the Temporary Insanity choice to help reduce their Madness.
                        </li>            
                        <li>The "Revert NPC" macro is for GM use and will revert a character that has been turned into an NPC by the final Phase of Madness back to a PC. If a character reaches the final phase, the system will immediately convert their character sheet into an NPC sheet.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1_Fd3OzLDR14NcoC0GXuv4uakjcPc4OR9" alt="Stasis" style="width: 500px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <li>The "Madness & Sanity Adjustment" macros are for GM use and allow for manual adjustment of the Sanity Point and Madness Point values of the characters.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1CNZnNjPSyyvWxLUe0dsqrVnnpVWj_6yf" alt="Stasis" style="width: 500px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                    </ul>    
                </p>
            <hr>    
            <h4>Settings & Customization</h4>
                <p>
                    <dl>
                        <dd>Most settings have been made adjustable, allowing each GM to customize the value ranges to fit their desired campaign.
                    </dd>
                    </dl>
                    <ul>
                        <li>You can adjust the starting Sanity and Madness values, as well as the points at which characters begin accumulating Madness due to the loss of Sanity Points.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1LcN2p_zGjO5p42H3OOOWXwPVqLJItqic" alt="Stasis" style="width: 500px; height: auto;" />
                                </td>
                            </tr>
                        </table>
                        <li>You can also adjust the amount the Rolltables reduce the Characters Madness and adjust the default values of the Sanity Roller.
                        </li>
                        <br>
                        <table align="center">
                            <tr>
                                <td>
                                    <img src="https://drive.google.com/uc?export=view&id=1Y_SuOJgxu4YcUr0DfWo_2bdijKzLC2Y8" alt="Stasis" style="width: 500px; height: auto;" />
                                </td>                              
                            </tr>
                        </table>
                    </ul>                            
                </p>    
            <hr>
            <dl>
            <dd>By incorporating these new mechanics, Fate's Descent deepens the role-playing experience, challenging characters to maintain their mental fortitude while facing the horrors of their adventures.</dd>
            </dl>
</body>

</html>
