import { useEffect } from "preact/hooks";
import download from "../lib/download.ts";
import runCode from "../lib/run.ts";
import { loadCodeFromString, loadSerializedState, makeNewState, patchStore, serializeState, useStore } from "../lib/state.ts";
import styles from "./Toolbar.module.css";
import Button from "../ui/Button.tsx";
import cx from "classnames";
// import CheckmarkIcon from "../ui/CheckmarkIcon.tsx";
import PlugIcon from "../ui/PlugIcon.tsx";
import { connect, disconnect, runMachine, tryAutoConnect } from "../lib/machine.ts";
import BrightnessContrastIcon from "../ui/BrightnessContrastIcon.tsx";
import { Theme, setColorTheme, theme } from "../ui/colorTheme.ts";

export default function Toolbar() {
    return (
        <div class={styles.root}>
            <h1 class={styles.heading}>Haxidraw</h1>
            <RunButton />
            <DownloadButton />
            <NewButton />
            <OpenButton />
            <MachineControls />
            <ThemeButton />
        </div>
    );
}

function RunButton() {
    // keyboard shortcut - shift+enter
    useEffect(() => {
        async function handleKeyDown(e: KeyboardEvent) {
            if(e.shiftKey && e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                await runCode();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    return (
        <Button variant="ghost" onClick={() => runCode()}>run (shift+enter)</Button>
    );
}

function DownloadButton() {
    const state = useStore();
    return (
        <Button variant="ghost" onClick={() => download("project.js", state.code.content)}>download</Button>
    );
}

function NewButton() {
    return (
        <Button variant="ghost" onClick={() => {
            patchStore({
                ...makeNewState()
            })
        }}>new</Button>
    )
}

function OpenButton() {
    return (
        <Button variant="ghost" onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".js";
            input.onchange = () => {
                if(input.files?.length) {
                    const file = input.files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                        if(typeof reader.result === "string") {
                            loadCodeFromString(reader.result);
                        }
                    }
                    reader.readAsText(file);
                }
            }
            input.click();
        }}>open</Button>
    );
}

function MachineControls() {
    const { inst, running } = useStore(["inst", "running"]);

    useEffect(() => {
        tryAutoConnect();
    }, []);

    return (
        <div class={styles.right}>
            {inst ? (
                <>
                    <Button variant="ghost" onClick={disconnect}>
                        <PlugIcon className={cx(styles.icon, styles.connectedIcon)} />
                        <span>disconnect...</span>
                    </Button>
                    {/* separator */}
                    <div class={styles.separator} />
                    <Button variant="ghost" loading={running} onClick={runMachine}>
                        run machine
                    </Button>
                </>
            ) : (
                <Button variant="ghost" onClick={connect}>
                    <PlugIcon className={cx(styles.icon, styles.disconnectedIcon)} />
                    <span>connect to machine...</span>
                </Button>
            )}
        </div>
    );
}

function ThemeButton() {
    return (
        <Button variant="ghost" icon aria-label="toggle theme" onClick={() => {
            setColorTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark)
        }}>
            <BrightnessContrastIcon />
        </Button>
    )
}