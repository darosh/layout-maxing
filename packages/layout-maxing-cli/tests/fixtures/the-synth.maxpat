{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 9,
            "minor": 1,
            "revision": 3,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [ 33.0, 71.0, 588.0, 508.0 ],
        "integercoordinates": 1,
        "boxes": [
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "bang", "int" ],
                    "patching_rect": [ 181.0, 90.0, 30.0, 22.0 ],
                    "text": "t b i"
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 181.0, 117.0, 50.0, 22.0 ],
                    "text": "pack 1 i"
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "slider",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 353.0, 15.0, 14.0, 53.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 15.0, 181.0, 150.0, 20.0 ],
                    "text": "THE SYNTH",
                    "varname": "obj-11"
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "patching_rect": [ 120.0, 90.0, 40.0, 22.0 ],
                    "text": "midiin",
                    "varname": "obj-10"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-8",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 855.0, 495.0, 210.0, 20.0 ],
                    "text": "-- KBD --",
                    "varname": "obj-8"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-7",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 1215.0, 210.0, 20.0 ],
                    "text": "-- KBD --",
                    "varname": "obj-7"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-2",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 1215.0, 210.0, 20.0 ],
                    "text": "-- KBD --",
                    "varname": "obj-2"
                }
            },
            {
                "box": {
                    "attr": "poly/lfo/pulsewidth",
                    "id": "obj-6",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 285.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-6"
                }
            },
            {
                "box": {
                    "attr": "poly/lfo/smooth",
                    "id": "obj-5",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 255.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-5"
                }
            },
            {
                "box": {
                    "attr": "poly/lfo/jitter",
                    "id": "obj-4",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 225.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-4"
                }
            },
            {
                "box": {
                    "attr": "poly/lfo/lfotype",
                    "id": "obj-3",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 195.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-3"
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "local": 1,
                    "maxclass": "ezdac~",
                    "numinlets": 2,
                    "numoutlets": 0,
                    "patching_rect": [ 15.0, 270.0, 48.0, 48.0 ],
                    "varname": "obj-9"
                }
            },
            {
                "box": {
                    "id": "obj-58",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 15.0, 90.0, 46.0, 22.0 ],
                    "text": "pack i i",
                    "varname": "obj-58"
                }
            },
            {
                "box": {
                    "id": "obj-55",
                    "maxclass": "newobj",
                    "numinlets": 7,
                    "numoutlets": 2,
                    "outlettype": [ "int", "" ],
                    "patching_rect": [ 15.0, 150.0, 82.0, 22.0 ],
                    "text": "midiformat",
                    "varname": "obj-55"
                }
            },
            {
                "box": {
                    "hkeycolor": [ 0.254, 0.559, 0.983, 1.0 ],
                    "id": "obj-53",
                    "maxclass": "kslider",
                    "mode": 2,
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "int", "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 15.0, 15.0, 336.0, 53.0 ],
                    "varname": "obj-53"
                }
            },
            {
                "box": {
                    "autosave": 1,
                    "id": "obj-1",
                    "inletInfo": {
                        "IOInfo": [
                            {
                                "type": "midi",
                                "index": -1,
                                "tag": "",
                                "comment": ""
                            }
                        ]
                    },
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 4,
                    "outletInfo": {
                        "IOInfo": [
                            {
                                "type": "signal",
                                "index": 1,
                                "tag": "out1",
                                "comment": ""
                            },
                            {
                                "type": "signal",
                                "index": 2,
                                "tag": "out2",
                                "comment": ""
                            },
                            {
                                "type": "midi",
                                "index": -1,
                                "tag": "",
                                "comment": ""
                            }
                        ]
                    },
                    "outlettype": [ "signal", "signal", "int", "list" ],
                    "patching_rect": [ 15.0, 210.0, 216.0, 22.0 ],
                    "rnboattrcache": {
                        "poly/voice1/osc_pulse_width_mod_amount": {
                            "label": "osc_pulse_width_mod_amount",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_at_cutoff": {
                            "label": "kbd_at_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/osc_noise": {
                            "label": "osc_noise",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "pitch_fine": {
                            "label": "pitch_fine",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vca_sustain": {
                            "label": "vca_sustain",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_level": {
                            "label": "vcf_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_at_lfo_vcf": {
                            "label": "kbd_at_lfo_vcf",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/osc_pulse_width": {
                            "label": "osc_pulse_width",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vca_attack": {
                            "label": "vca_attack",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/lfo_vcf": {
                            "label": "lfo_vcf",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/osc_pulse_width_mod_speed": {
                            "label": "osc_pulse_width_mod_speed",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_vcf_lo": {
                            "label": "kbd_vcf_lo",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_level_initial": {
                            "label": "vcf_level_initial",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "lfo_speed": {
                            "label": "lfo_speed",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_lp_cutoff": {
                            "label": "vcf_lp_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/osc_saw": {
                            "label": "osc_saw",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_lp_cutoff": {
                            "label": "vcf_lp_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/lfo/pulsewidth": {
                            "label": "pulsewidth",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_at_level": {
                            "label": "kbd_at_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_vel_pb": {
                            "label": "kbd_vel_pb",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_vca_hi": {
                            "label": "kbd_vca_hi",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vca_release": {
                            "label": "vca_release",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_vcf_lo": {
                            "label": "kbd_vcf_lo",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/osc_pulse_width_mod_amount": {
                            "label": "osc_pulse_width_mod_amount",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_at_level": {
                            "label": "kbd_at_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_env_decay": {
                            "label": "vcf_env_decay",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_env_attack": {
                            "label": "vcf_env_attack",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "master_vol": {
                            "label": "master_vol",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/osc_noise": {
                            "label": "osc_noise",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "vcf_brilliance": {
                            "label": "vcf_brilliance",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "layer_mix": {
                            "label": "layer_mix",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vca_decay": {
                            "label": "vca_decay",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/osc_sine": {
                            "label": "osc_sine",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_at_lfo_vcf": {
                            "label": "kbd_at_lfo_vcf",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/pitch_detune": {
                            "label": "pitch_detune",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/layer_level": {
                            "label": "layer_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_hp_cutoff": {
                            "label": "vcf_hp_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/osc_pulse": {
                            "label": "osc_pulse",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_at_lfo_vco": {
                            "label": "kbd_at_lfo_vco",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vca_decay": {
                            "label": "vca_decay",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/lfo_vca": {
                            "label": "lfo_vca",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/osc_pulse": {
                            "label": "osc_pulse",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/osc_saw": {
                            "label": "osc_saw",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/lfo/jitter": {
                            "label": "jitter",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vca_attack": {
                            "label": "vca_attack",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_vel_pb": {
                            "label": "kbd_vel_pb",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/lfo_vco": {
                            "label": "lfo_vco",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/osc_pulse_width": {
                            "label": "osc_pulse_width",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_vca_lo": {
                            "label": "kbd_vca_lo",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_lp_res": {
                            "label": "vcf_lp_res",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_env_attack": {
                            "label": "vcf_env_attack",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/port_time": {
                            "label": "port_time",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/osc_pulse_width_mod_speed": {
                            "label": "osc_pulse_width_mod_speed",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "kbd_at_lfo_speed": {
                            "label": "kbd_at_lfo_speed",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_hp_res": {
                            "label": "vcf_hp_res",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "pitch_coarse": {
                            "label": "pitch_coarse",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/lfo_vcf": {
                            "label": "lfo_vcf",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_vcf_hi": {
                            "label": "kbd_vcf_hi",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_level_initial": {
                            "label": "vcf_level_initial",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/lfo_vca": {
                            "label": "lfo_vca",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_env_release": {
                            "label": "vcf_env_release",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vca_release": {
                            "label": "vca_release",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_at_cutoff": {
                            "label": "kbd_at_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_env_decay": {
                            "label": "vcf_env_decay",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_vel_cutoff": {
                            "label": "kbd_vel_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/pitch_detune": {
                            "label": "pitch_detune",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_vca_lo": {
                            "label": "kbd_vca_lo",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "vcf_resonance": {
                            "label": "vcf_resonance",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/lfo/smooth": {
                            "label": "smooth",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_vel_level": {
                            "label": "kbd_vel_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_at_lfo_vco": {
                            "label": "kbd_at_lfo_vco",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_vca_hi": {
                            "label": "kbd_vca_hi",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/layer_level": {
                            "label": "layer_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_hp_cutoff": {
                            "label": "vcf_hp_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_level": {
                            "label": "vcf_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_vcf_hi": {
                            "label": "kbd_vcf_hi",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_level_attack": {
                            "label": "vcf_level_attack",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vca_sustain": {
                            "label": "vca_sustain",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/kbd_vel_cutoff": {
                            "label": "kbd_vel_cutoff",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_env_release": {
                            "label": "vcf_env_release",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/port_time": {
                            "label": "port_time",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_hp_res": {
                            "label": "vcf_hp_res",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/vcf_lp_res": {
                            "label": "vcf_lp_res",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/vcf_level_attack": {
                            "label": "vcf_level_attack",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice1/lfo_vco": {
                            "label": "lfo_vco",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/kbd_vel_level": {
                            "label": "kbd_vel_level",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "poly/voice2/osc_sine": {
                            "label": "osc_sine",
                            "isEnum": 0,
                            "parsestring": ""
                        },
                        "kbd_slide_dest": {
                            "label": "kbd_slide_dest",
                            "isEnum": 1,
                            "parsestring": "\"lfo_speed\" \"lfo_vco\" \"lfo_vcf\" \"lfo_vca\" \"vcf_brilliance\" \"lpf_I\" \"lpf_II\" \"hpf_I\" \"hpf_II\""
                        },
                        "kbd_mod_dest": {
                            "label": "kbd_mod_dest",
                            "isEnum": 1,
                            "parsestring": "\"lfo_vco\" \"lfo_vcf\" \"lfo_vca\" \"vcf_brilliance\" \"port_time\" \"pwm_spd_I\" \"pwm_spd_II\" \"pwm_spd_both\" \"pitch_detune\" \"feet_I\" \"feet_II\" \"noise_I\" \"noise_II\""
                        },
                        "poly/lfo/lfotype": {
                            "label": "lfotype",
                            "isEnum": 1,
                            "parsestring": "\"sine\" \"ramp\" \"square\" \"rect\" \"tri\""
                        },
                        "poly/lfo/on": {
                            "label": "on",
                            "isEnum": 1,
                            "parsestring": "\"false\" \"true\""
                        },
                        "poly/voice1/port_mode": {
                            "label": "port_mode",
                            "isEnum": 1,
                            "parsestring": "\"off\" \"portamento\" \"glissando\""
                        },
                        "poly/voice1/pitch_feet": {
                            "label": "pitch_feet",
                            "isEnum": 1,
                            "parsestring": "\"16ft\" \"8ft\" \"5ft3\" \"4ft\" \"2ft3\" \"2ft\""
                        },
                        "poly/voice2/port_mode": {
                            "label": "port_mode",
                            "isEnum": 1,
                            "parsestring": "\"off\" \"portamento\" \"glissando\""
                        },
                        "poly/voice2/pitch_feet": {
                            "label": "pitch_feet",
                            "isEnum": 1,
                            "parsestring": "\"16ft\" \"8ft\" \"5ft3\" \"4ft\" \"2ft3\" \"2ft\""
                        }
                    },
                    "rnboversion": "1.4.3",
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_invisible": 1,
                            "parameter_longname": "rnbo~[1]",
                            "parameter_modmode": 0,
                            "parameter_shortname": "rnbo~[1]",
                            "parameter_type": 3
                        }
                    },
                    "saved_object_attributes": {
                        "optimization": "O1",
                        "parameter_enable": 1,
                        "polyphony": 8,
                        "uuid": "abcc0a17-2c39-11f1-8a17-de14237c4a51"
                    },
                    "snapshot": {
                        "filetype": "C74Snapshot",
                        "version": 2,
                        "minorversion": 0,
                        "name": "snapshotlist",
                        "origin": "rnbo~",
                        "type": "list",
                        "subtype": "Undefined",
                        "embed": 1,
                        "snapshot": {
                            "__sps": {
                                "poly": [
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "__sps": {
                                            "voice2": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 1762.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "voice1": {
                                                "__sps": {
                                                    "lpf": {                                                    },
                                                    "hpf": {                                                    }
                                                },
                                                "pitch_feet": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vcf_lo": {
                                                    "value": 0.0
                                                },
                                                "vca_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_at_cutoff": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_res": {
                                                    "value": 1.0
                                                },
                                                "osc_sine": {
                                                    "value": 0.0
                                                },
                                                "vca_sustain": {
                                                    "value": 0.8
                                                },
                                                "lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_res": {
                                                    "value": 1.0
                                                },
                                                "kbd_at_level": {
                                                    "value": 0.0
                                                },
                                                "layer_level": {
                                                    "value": 0.5000000000000001
                                                },
                                                "kbd_vca_lo": {
                                                    "value": 0.0
                                                },
                                                "osc_saw": {
                                                    "value": 1.0
                                                },
                                                "port_time": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width": {
                                                    "value": 0.5
                                                },
                                                "vca_decay": {
                                                    "value": 200.0
                                                },
                                                "lfo_vco": {
                                                    "value": 0.0
                                                },
                                                "kbd_vel_pb": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_speed": {
                                                    "value": 1.0
                                                },
                                                "vcf_env_release": {
                                                    "value": 200.0
                                                },
                                                "kbd_vel_level": {
                                                    "value": 0.0
                                                },
                                                "vcf_level": {
                                                    "value": 0.5
                                                },
                                                "lfo_vca": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_attack": {
                                                    "value": 500.0
                                                },
                                                "vca_attack": {
                                                    "value": 10.0
                                                },
                                                "kbd_vel_cutoff": {
                                                    "value": 0.0
                                                },
                                                "port_mode": {
                                                    "value": 0.0
                                                },
                                                "vcf_level_initial": {
                                                    "value": 0.0
                                                },
                                                "vcf_env_decay": {
                                                    "value": 200.0
                                                },
                                                "osc_pulse": {
                                                    "value": 0.0
                                                },
                                                "kbd_at_lfo_vcf": {
                                                    "value": 0.0
                                                },
                                                "vcf_lp_cutoff": {
                                                    "value": 2000.0
                                                },
                                                "pitch_detune": {
                                                    "value": 0.0
                                                },
                                                "vcf_hp_cutoff": {
                                                    "value": 20.0
                                                },
                                                "kbd_vca_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_pulse_width_mod_amount": {
                                                    "value": 0.0
                                                },
                                                "kbd_vcf_hi": {
                                                    "value": 0.0
                                                },
                                                "osc_noise": {
                                                    "value": 0.0
                                                }
                                            },
                                            "lfo": {
                                                "__sps": {
                                                    "rect": {                                                    },
                                                    "square": {                                                    },
                                                    "jitter[1]": {                                                    },
                                                    "smooth[1]": {                                                    }
                                                },
                                                "pulsewidth": {
                                                    "value": 0.8
                                                },
                                                "jitter": {
                                                    "value": 0.0
                                                },
                                                "smooth": {
                                                    "value": 0.0
                                                },
                                                "on": {
                                                    "value": 1.0
                                                },
                                                "lfotype": {
                                                    "value": 0.0
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            "lfo_speed": {
                                "value": 4.0
                            },
                            "kbd_mod_dest": {
                                "value": 2.0
                            },
                            "kbd_at_lfo_speed": {
                                "value": 0.0
                            },
                            "vcf_brilliance": {
                                "value": 0.0
                            },
                            "vcf_resonance": {
                                "value": 0.0
                            },
                            "layer_mix": {
                                "value": 0.0
                            },
                            "__presetid": "the-synth.rnbopat",
                            "master_vol": {
                                "value": 0.5000000000000001
                            },
                            "kbd_slide_dest": {
                                "value": 0.0
                            },
                            "pitch_fine": {
                                "value": 0.0
                            },
                            "pitch_coarse": {
                                "value": 0.0
                            }
                        },
                        "snapshotlist": {
                            "current_snapshot": 0,
                            "entries": [
                                {
                                    "filetype": "C74Snapshot",
                                    "version": 2,
                                    "minorversion": 0,
                                    "name": "Default",
                                    "origin": "the-synth.rnbopat",
                                    "type": "rnbo",
                                    "subtype": "",
                                    "embed": 1,
                                    "snapshot": {
                                        "__sps": {
                                            "poly": [
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                },
                                                {
                                                    "__sps": {
                                                        "voice2": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 1762.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "voice1": {
                                                            "__sps": {
                                                                "lpf": {                                                                },
                                                                "hpf": {                                                                }
                                                            },
                                                            "pitch_feet": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vcf_lo": {
                                                                "value": 0.0
                                                            },
                                                            "vca_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_at_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_res": {
                                                                "value": 1.0
                                                            },
                                                            "osc_sine": {
                                                                "value": 0.0
                                                            },
                                                            "vca_sustain": {
                                                                "value": 0.8
                                                            },
                                                            "lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_res": {
                                                                "value": 1.0
                                                            },
                                                            "kbd_at_level": {
                                                                "value": 0.0
                                                            },
                                                            "layer_level": {
                                                                "value": 0.5000000000000001
                                                            },
                                                            "kbd_vca_lo": {
                                                                "value": 0.0
                                                            },
                                                            "osc_saw": {
                                                                "value": 1.0
                                                            },
                                                            "port_time": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width": {
                                                                "value": 0.5
                                                            },
                                                            "vca_decay": {
                                                                "value": 200.0
                                                            },
                                                            "lfo_vco": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vel_pb": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_speed": {
                                                                "value": 1.0
                                                            },
                                                            "vcf_env_release": {
                                                                "value": 200.0
                                                            },
                                                            "kbd_vel_level": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level": {
                                                                "value": 0.5
                                                            },
                                                            "lfo_vca": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_attack": {
                                                                "value": 500.0
                                                            },
                                                            "vca_attack": {
                                                                "value": 10.0
                                                            },
                                                            "kbd_vel_cutoff": {
                                                                "value": 0.0
                                                            },
                                                            "port_mode": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_level_initial": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_env_decay": {
                                                                "value": 200.0
                                                            },
                                                            "osc_pulse": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_at_lfo_vcf": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_lp_cutoff": {
                                                                "value": 2000.0
                                                            },
                                                            "pitch_detune": {
                                                                "value": 0.0
                                                            },
                                                            "vcf_hp_cutoff": {
                                                                "value": 20.0
                                                            },
                                                            "kbd_vca_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_pulse_width_mod_amount": {
                                                                "value": 0.0
                                                            },
                                                            "kbd_vcf_hi": {
                                                                "value": 0.0
                                                            },
                                                            "osc_noise": {
                                                                "value": 0.0
                                                            }
                                                        },
                                                        "lfo": {
                                                            "__sps": {
                                                                "rect": {                                                                },
                                                                "square": {                                                                },
                                                                "jitter[1]": {                                                                },
                                                                "smooth[1]": {                                                                }
                                                            },
                                                            "pulsewidth": {
                                                                "value": 0.8
                                                            },
                                                            "jitter": {
                                                                "value": 0.0
                                                            },
                                                            "smooth": {
                                                                "value": 0.0
                                                            },
                                                            "on": {
                                                                "value": 1.0
                                                            },
                                                            "lfotype": {
                                                                "value": 0.0
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        "lfo_speed": {
                                            "value": 4.0
                                        },
                                        "kbd_mod_dest": {
                                            "value": 2.0
                                        },
                                        "kbd_at_lfo_speed": {
                                            "value": 0.0
                                        },
                                        "vcf_brilliance": {
                                            "value": 0.0
                                        },
                                        "vcf_resonance": {
                                            "value": 0.0
                                        },
                                        "layer_mix": {
                                            "value": 0.0
                                        },
                                        "__presetid": "the-synth.rnbopat",
                                        "master_vol": {
                                            "value": 0.5000000000000001
                                        },
                                        "kbd_slide_dest": {
                                            "value": 0.0
                                        },
                                        "pitch_fine": {
                                            "value": 0.0
                                        },
                                        "pitch_coarse": {
                                            "value": 0.0
                                        }
                                    },
                                    "fileref": {
                                        "name": "Default",
                                        "filename": "the-synth.rnbopat.maxsnap",
                                        "filepath": "~/Documents/Max 9/Snapshots",
                                        "filepos": -1,
                                        "snapshotfileid": "8d07d465d2615d890d30b64745cb69c6"
                                    }
                                }
                            ]
                        }
                    },
                    "text": "rnbo~ the-synth.rnbopat @polyphony 8",
                    "varname": "rnbo~[1]"
                }
            },
            {
                "box": {
                    "id": "obj-loadmess",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 120.0, 150.0, 150.0, 22.0 ],
                    "text": "loadmess startwindow",
                    "varname": "obj-loadmess"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p200",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 15.0, 210.0, 20.0 ],
                    "text": "LAYER I",
                    "varname": "obj-p200"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p201",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 45.0, 210.0, 20.0 ],
                    "text": "-- OSC --",
                    "varname": "obj-p201"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/osc_saw",
                    "id": "obj-p202",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 75.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p202"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/osc_pulse",
                    "id": "obj-p203",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 105.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p203"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/osc_pulse_width",
                    "id": "obj-p204",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 135.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p204"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/osc_pulse_width_mod_speed",
                    "id": "obj-p205",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 165.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p205"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/osc_pulse_width_mod_amount",
                    "id": "obj-p206",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 195.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p206"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/osc_noise",
                    "id": "obj-p207",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 225.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p207"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/osc_sine",
                    "id": "obj-p208",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 255.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p208"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_level",
                    "id": "obj-p209",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 285.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p209"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p210",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 315.0, 210.0, 20.0 ],
                    "text": "-- FILTER --",
                    "varname": "obj-p210"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_hp_cutoff",
                    "id": "obj-p211",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 345.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p211"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_hp_res",
                    "id": "obj-p212",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 375.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p212"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_lp_cutoff",
                    "id": "obj-p213",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 405.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p213"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_lp_res",
                    "id": "obj-p214",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 435.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p214"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_level_attack",
                    "id": "obj-p215",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 465.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p215"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p216",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 495.0, 210.0, 20.0 ],
                    "text": "-- FILT ENV --",
                    "varname": "obj-p216"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_env_attack",
                    "id": "obj-p217",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 525.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p217"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_env_decay",
                    "id": "obj-p218",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 555.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p218"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_level_initial",
                    "id": "obj-p219",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 585.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p219"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vcf_env_release",
                    "id": "obj-p220",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 615.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p220"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p221",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 645.0, 210.0, 20.0 ],
                    "text": "-- VCA ENV --",
                    "varname": "obj-p221"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vca_attack",
                    "id": "obj-p222",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 675.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p222"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vca_decay",
                    "id": "obj-p223",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 705.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p223"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vca_sustain",
                    "id": "obj-p224",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 735.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p224"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/vca_release",
                    "id": "obj-p225",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 765.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p225"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p226",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 795.0, 210.0, 20.0 ],
                    "text": "-- LFO MOD --",
                    "varname": "obj-p226"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/lfo_vco",
                    "id": "obj-p227",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 825.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p227"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/lfo_vcf",
                    "id": "obj-p228",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 855.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p228"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/lfo_vca",
                    "id": "obj-p229",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 885.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p229"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p230",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 915.0, 210.0, 20.0 ],
                    "text": "-- LEVEL --",
                    "varname": "obj-p230"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/layer_level",
                    "id": "obj-p231",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 945.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p231"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/pitch_detune",
                    "id": "obj-p232",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 975.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p232"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p233",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 15.0, 210.0, 20.0 ],
                    "text": "LAYER II",
                    "varname": "obj-p233"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p234",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 45.0, 210.0, 20.0 ],
                    "text": "-- OSC --",
                    "varname": "obj-p234"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/osc_saw",
                    "id": "obj-p235",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 75.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p235"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/osc_pulse",
                    "id": "obj-p236",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 105.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p236"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/osc_pulse_width",
                    "id": "obj-p237",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 135.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p237"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/osc_pulse_width_mod_speed",
                    "id": "obj-p238",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 165.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p238"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/osc_pulse_width_mod_amount",
                    "id": "obj-p239",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 195.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p239"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/osc_noise",
                    "id": "obj-p240",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 225.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p240"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/osc_sine",
                    "id": "obj-p241",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 255.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p241"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_level",
                    "id": "obj-p242",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 285.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p242"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p243",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 315.0, 210.0, 20.0 ],
                    "text": "-- FILTER --",
                    "varname": "obj-p243"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_hp_cutoff",
                    "id": "obj-p244",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 345.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p244"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_hp_res",
                    "id": "obj-p245",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 375.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p245"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_lp_cutoff",
                    "id": "obj-p246",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 405.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p246"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_lp_res",
                    "id": "obj-p247",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 435.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p247"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_level_attack",
                    "id": "obj-p248",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 465.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p248"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p249",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 495.0, 210.0, 20.0 ],
                    "text": "-- FILT ENV --",
                    "varname": "obj-p249"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_env_attack",
                    "id": "obj-p250",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 525.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p250"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_env_decay",
                    "id": "obj-p251",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 555.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p251"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_level_initial",
                    "id": "obj-p252",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 585.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p252"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vcf_env_release",
                    "id": "obj-p253",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 615.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p253"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p254",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 645.0, 210.0, 20.0 ],
                    "text": "-- VCA ENV --",
                    "varname": "obj-p254"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vca_attack",
                    "id": "obj-p255",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 675.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p255"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vca_decay",
                    "id": "obj-p256",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 705.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p256"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vca_sustain",
                    "id": "obj-p257",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 735.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p257"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/vca_release",
                    "id": "obj-p258",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 765.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p258"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p259",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 795.0, 210.0, 20.0 ],
                    "text": "-- LFO MOD --",
                    "varname": "obj-p259"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/lfo_vco",
                    "id": "obj-p260",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 825.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p260"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/lfo_vcf",
                    "id": "obj-p261",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 855.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p261"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/lfo_vca",
                    "id": "obj-p262",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 885.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p262"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p263",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 915.0, 210.0, 20.0 ],
                    "text": "-- LEVEL --",
                    "varname": "obj-p263"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/layer_level",
                    "id": "obj-p264",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 945.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p264"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/pitch_detune",
                    "id": "obj-p265",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 975.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p265"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p266",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 855.0, 15.0, 210.0, 20.0 ],
                    "text": "GLOBAL",
                    "varname": "obj-p266"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p267",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 855.0, 45.0, 210.0, 20.0 ],
                    "text": "-- PITCH --",
                    "varname": "obj-p267"
                }
            },
            {
                "box": {
                    "attr": "pitch_coarse",
                    "id": "obj-p268",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 75.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p268"
                }
            },
            {
                "box": {
                    "attr": "pitch_fine",
                    "id": "obj-p269",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 105.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p269"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p270",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 855.0, 135.0, 210.0, 20.0 ],
                    "text": "-- LFO --",
                    "varname": "obj-p270"
                }
            },
            {
                "box": {
                    "attr": "lfo_speed",
                    "id": "obj-p271",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 165.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p271"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p274",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 855.0, 315.0, 210.0, 20.0 ],
                    "text": "-- MASTER --",
                    "varname": "obj-p274"
                }
            },
            {
                "box": {
                    "attr": "master_vol",
                    "id": "obj-p275",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 345.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p275"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p276",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 1005.0, 210.0, 20.0 ],
                    "text": "-- VELOCITY / AT --",
                    "varname": "obj-p276"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_vel_cutoff",
                    "id": "obj-p277",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1035.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p277"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_vel_level",
                    "id": "obj-p278",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1065.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p278"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_at_cutoff",
                    "id": "obj-p279",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1095.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p279"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_at_level",
                    "id": "obj-p280",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1125.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p280"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p281",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 375.0, 1155.0, 210.0, 20.0 ],
                    "text": "-- FEET --",
                    "varname": "obj-p281"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/pitch_feet",
                    "id": "obj-p282",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1185.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p282"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p283",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 1005.0, 210.0, 20.0 ],
                    "text": "-- VELOCITY / AT --",
                    "varname": "obj-p283"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_vel_cutoff",
                    "id": "obj-p284",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1035.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p284"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_vel_level",
                    "id": "obj-p285",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1065.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p285"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_at_cutoff",
                    "id": "obj-p286",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1095.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p286"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_at_level",
                    "id": "obj-p287",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1125.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p287"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p288",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 615.0, 1155.0, 210.0, 20.0 ],
                    "text": "-- FEET --",
                    "varname": "obj-p288"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/pitch_feet",
                    "id": "obj-p289",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1185.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p289"
                }
            },
            {
                "box": {
                    "fontface": 1,
                    "id": "obj-p290",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 855.0, 375.0, 210.0, 20.0 ],
                    "text": "-- MIX / TONE --",
                    "varname": "obj-p290"
                }
            },
            {
                "box": {
                    "attr": "layer_mix",
                    "id": "obj-p291",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 405.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p291"
                }
            },
            {
                "box": {
                    "attr": "vcf_brilliance",
                    "id": "obj-p292",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 435.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p292"
                }
            },
            {
                "box": {
                    "attr": "vcf_resonance",
                    "id": "obj-p293",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 465.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p293"
                }
            },
            {
                "box": {
                    "attr": "kbd_at_lfo_speed",
                    "id": "obj-p300",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 525.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p300"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_vel_pb",
                    "id": "obj-p301",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1245.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p301"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_vel_pb",
                    "id": "obj-p302",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1245.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p302"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_at_lfo_vco",
                    "id": "obj-p303",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1275.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p303"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_at_lfo_vco",
                    "id": "obj-p304",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1275.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p304"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_at_lfo_vcf",
                    "id": "obj-p305",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1305.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p305"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_at_lfo_vcf",
                    "id": "obj-p306",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1305.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p306"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_vcf_lo",
                    "id": "obj-p307",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1335.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p307"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_vcf_lo",
                    "id": "obj-p308",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1335.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p308"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_vcf_hi",
                    "id": "obj-p309",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1365.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p309"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_vcf_hi",
                    "id": "obj-p310",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1365.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p310"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_vca_lo",
                    "id": "obj-p311",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1395.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p311"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_vca_lo",
                    "id": "obj-p312",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1395.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p312"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/kbd_vca_hi",
                    "id": "obj-p313",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1425.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p313"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/kbd_vca_hi",
                    "id": "obj-p314",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1425.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p314"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/port_time",
                    "id": "obj-p315",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1455.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p315"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/port_time",
                    "id": "obj-p316",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1455.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p316"
                }
            },
            {
                "box": {
                    "attr": "poly/voice1/port_mode",
                    "id": "obj-p317",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 375.0, 1485.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p317"
                }
            },
            {
                "box": {
                    "attr": "poly/voice2/port_mode",
                    "id": "obj-p318",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 615.0, 1485.0, 210.0, 22.0 ],
                    "text_width": 160.0,
                    "varname": "obj-p318"
                }
            },
            {
                "box": {
                    "attr": "kbd_slide_dest",
                    "id": "obj-59",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 555.0, 210.0, 22.0 ],
                    "varname": "obj-59"
                }
            },
            {
                "box": {
                    "attr": "kbd_mod_dest",
                    "id": "obj-319",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 855.0, 585.0, 210.0, 22.0 ],
                    "varname": "obj-319"
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-9", 1 ],
                    "source": [ "obj-1", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-9", 0 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 1 ],
                    "source": [ "obj-10", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-14", 0 ],
                    "source": [ "obj-12", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-55", 2 ],
                    "source": [ "obj-13", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 1 ],
                    "source": [ "obj-14", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 0 ],
                    "source": [ "obj-14", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-3", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-319", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-5", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-58", 1 ],
                    "source": [ "obj-53", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-58", 0 ],
                    "source": [ "obj-53", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 1 ],
                    "source": [ "obj-55", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-55", 0 ],
                    "source": [ "obj-58", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-59", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-9", 0 ],
                    "source": [ "obj-loadmess", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p202", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p203", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p204", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p205", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p206", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p207", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p208", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p209", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p211", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p212", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p213", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p214", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p215", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p217", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p218", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p219", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p220", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p222", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p223", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p224", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p225", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p227", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p228", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p229", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p231", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p232", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p235", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p236", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p237", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p238", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p239", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p240", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p241", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p242", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p244", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p245", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p246", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p247", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p248", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p250", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p251", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p252", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p253", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p255", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p256", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p257", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p258", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p260", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p261", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p262", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p264", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p265", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p268", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p269", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p271", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p275", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p277", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p278", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p279", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p280", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p282", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p284", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p285", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p286", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p287", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p289", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p291", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p292", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p293", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p300", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p301", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p302", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p303", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p304", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p305", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p306", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p307", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p308", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p309", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p310", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p311", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p312", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p313", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p314", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p315", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p316", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p317", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-p318", 0 ]
                }
            }
        ],
        "parameters": {
            "obj-1": [ "rnbo~[1]", "rnbo~[1]", 0 ],
            "parameterbanks": {
                "0": {
                    "index": 0,
                    "name": "",
                    "parameters": [ "-", "-", "-", "-", "-", "-", "-", "-" ],
                    "buttons": [ "-", "-", "-", "-", "-", "-", "-", "-" ]
                }
            },
            "inherited_shortname": 1
        },
        "autosave": 0
    }
}