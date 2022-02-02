const robot = require("robotjs");

import GyroServ from './gyro-server';

const VGen = require("vgen-xbox");
const vgen = new VGen();

function isOdd(int: number) {
	return (int & 1) === 1;
}
function heldKeysBitmask(HeldKeys) {
	return {
		A: isOdd(HeldKeys >> 0),
		B: isOdd(HeldKeys >> 1),
		X: isOdd(HeldKeys >> 2),
		Y: isOdd(HeldKeys >> 3),
		LS: isOdd(HeldKeys >> 4),
		RS: isOdd(HeldKeys >> 5),
		L: isOdd(HeldKeys >> 6),
		R: isOdd(HeldKeys >> 7),
		ZL: isOdd(HeldKeys >> 8),
		ZR: isOdd(HeldKeys >> 9),
		Plus: isOdd(HeldKeys >> 10),
		Minus: isOdd(HeldKeys >> 11),
		Left: isOdd(HeldKeys >> 12),
		Up: isOdd(HeldKeys >> 13),
		Right: isOdd(HeldKeys >> 14),
		Down: isOdd(HeldKeys >> 15)
	}
}
function convertAnalog(axis): number {
	let na;
	if (axis) {
		na = axis / 32767.5
	}
	if (na > 1) {
		na = 2 - na
		na = -na
	}
	return na;
}
function convertAnalogXY(x, y): [number, number] {
	return [ convertAnalog(x), convertAnalog(y) ];
}

class SwitchControllerHandler
{
	public get ControllerIds(): number[] { return this.controllerIds; }

	private controllerIds: number[] = [];

	private abSwap = false;
	private xySwap = false;
	private touchX1old = 0;
	private touchY1old = 0;
	private leftClicking = false;
	private rightTouchTime = 0;
	private leftTouchTime = 0;
	private rightClicking = false;
	private scrolling = false;
	private toggledMouseInput = false;
	private mouseControl = "ANALOG";
	private mouseInput = false;
	private touchLeftClicking = false;
	private touchRightClicking = false;

	public setPlayerCount(hid, controllerCount: number)
	{
		if (controllerCount > this.controllerIds.length) {
			this.plugControllerIn();
		}
	}

	public

	public disconnect()
	{
		try {
			for (let i in this.controllerIds) {
				vgen.unplug(this.controllerIds[i]);
			}
			this.controllerIds = [];
		} catch (error) { }
	}

	public handleControllerInput(hid, controllerId, playerNumber) {
		const heldKeys = hid.get("HeldKeys" + playerNumber);
		const LJoyX = convertAnalog(hid.get("LJoyX" + playerNumber));
		const LJoyY = convertAnalog(hid.get("LJoyY" + playerNumber));
		const RJoyX = convertAnalog(hid.get("RJoyX" + playerNumber));
		const RJoyY = convertAnalog(hid.get("RJoyY" + playerNumber));
		vgen.setAxisL(controllerId, LJoyX, LJoyY);
		vgen.setAxisR(controllerId, RJoyX, RJoyY);
		const inputStates = heldKeysBitmask(heldKeys);

		// Button mapping
		if(!this.abSwap)
		{
			vgen.setButton(controllerId, vgen.Buttons.B, inputStates.A);
			vgen.setButton(controllerId, vgen.Buttons.A, inputStates.B);
		}
		else
		{
			vgen.setButton(controllerId, vgen.Buttons.B, inputStates.B);
			vgen.setButton(controllerId, vgen.Buttons.A, inputStates.A);
		}

		if(!this.xySwap)
		{
			vgen.setButton(controllerId, vgen.Buttons.X, inputStates.Y);
			vgen.setButton(controllerId, vgen.Buttons.Y, inputStates.X);
		}
		else {

			vgen.setButton(controllerId, vgen.Buttons.X, inputStates.X);
			vgen.setButton(controllerId, vgen.Buttons.Y, inputStates.Y);
		}

		vgen.setButton(controllerId, vgen.Buttons.BACK, inputStates.Minus);
		vgen.setButton(controllerId, vgen.Buttons.START, inputStates.Plus);
		vgen.setButton(controllerId, vgen.Buttons.LEFT_SHOULDER, inputStates.L);
		vgen.setButton(controllerId, vgen.Buttons.RIGHT_SHOULDER, inputStates.R);
		vgen.setButton(controllerId, vgen.Buttons.LEFT_THUMB, inputStates.LS);
		vgen.setButton(controllerId, vgen.Buttons.RIGHT_THUMB, inputStates.RS);

		// Trigger Mapping
		if (inputStates.ZL) {
			vgen.setTriggerL(controllerId, 1);
		} else {
			vgen.setTriggerL(controllerId, 0);
		}
		if (inputStates.ZR) {
			vgen.setTriggerR(controllerId, 1);
		} else {
			vgen.setTriggerR(controllerId, 0);
		}
		// Dpad mapping
		if (inputStates.Up || inputStates.Down || inputStates.Left || inputStates.Right) {
			if (inputStates.Up) {
				if (inputStates.Left || inputStates.Right) {
					if (inputStates.Left) {
						vgen.setDpad(controllerId, vgen.Dpad.UP_LEFT);
					} else {
						vgen.setDpad(controllerId, vgen.Dpad.UP_RIGHT);
					}
				} else {
					vgen.setDpad(controllerId, vgen.Dpad.UP);
				}
			} else if (inputStates.Down) {
				if (inputStates.Left || inputStates.Right) {
					if (inputStates.Left) {
						vgen.setDpad(controllerId, vgen.Dpad.DOWN_LEFT);
					} else {
						vgen.setDpad(controllerId, vgen.Dpad.DOWN_RIGHT);
					}
				} else {
					vgen.setDpad(controllerId, vgen.Dpad.DOWN);
				}
			} else if (inputStates.Left) {
				vgen.setDpad(controllerId, vgen.Dpad.LEFT);
			} else if (inputStates.Right) {
				vgen.setDpad(controllerId, vgen.Dpad.RIGHT);
			}
		} else {
			vgen.setDpad(controllerId, vgen.Dpad.NONE);
		}
	}
	public handleMouseInputToggling(hid, playerNumber) {
		const heldKeys = hid.get("HeldKeys" + playerNumber);
		const inputStates = heldKeysBitmask(heldKeys);
		if (inputStates.LS && inputStates.RS) {
			if (!this.toggledMouseInput) {
				this.mouseInput = !this.mouseInput;
				this.toggledMouseInput = true;
			}
		} else {
			this.toggledMouseInput = false;
		}
	}
	public handleMouse(hid, playerNumber: number, [width, height]) {
		if (this.mouseControl == "ANALOG" && this.mouseInput) {
			this.handleAnalogMouse(hid, playerNumber);
		} else if (this.mouseControl == "GYRO" && this.mouseInput) {
			this.handleGyroMouse(hid, playerNumber, [width, height]);
		}
	}

	private handleAnalogMouse(hid, playerNumber) {
		const RJoyX = convertAnalog(hid.get("RJoyX" + playerNumber));
		const RJoyY = convertAnalog(hid.get("RJoyY" + playerNumber));
		const LJoyX = convertAnalog(hid.get("LJoyX" + playerNumber));
		const LJoyY = convertAnalog(hid.get("LJoyY" + playerNumber));
		const heldKeys = hid.get("HeldKeys" + playerNumber);
		const inputStates = heldKeysBitmask(heldKeys);
		const mouse = robot.getMousePos(),
			mx = mouse.x + (RJoyX * 25),
			my = mouse.y - (RJoyY * 25);
		if (mx && my) {
			robot.moveMouse(mx, my);
		}
		if (LJoyX || LJoyY) {
			robot.scrollMouse(LJoyX, LJoyY);
		}
		if (inputStates.ZR) {
			if (!this.leftClicking) {
				robot.mouseToggle("down");
				this.leftClicking = true;
			}
		} else {
			if (this.leftClicking) {
				robot.mouseToggle("up");
				this.leftClicking = false;
			}
		}
		if (inputStates.ZL) {
			if (!this.rightClicking) {
				robot.mouseToggle("down", "right");
				this.rightClicking = true;
			}
		} else {
			if (this.rightClicking) {
				robot.mouseToggle("up", "right");
				this.rightClicking = false;
			}
		}
	}
	private handleGyroMouse(hid, playerNumber, [width, height]: [number, number]) {
		const RJoyX = convertAnalog(hid.get("RJoyX" + playerNumber));
		const RJoyY = convertAnalog(hid.get("RJoyY" + playerNumber));
		const heldKeys = hid.get("HeldKeys" + playerNumber);
		const inputStates = heldKeysBitmask(heldKeys);
		const gyro = { x: hid.get("gyroX"), y: hid.get("gyroY"), z: hid.get("gyroZ") }
		this.smoothGyroMouse(gyro);
		const mouse = robot.getMousePos();
		const ngx = gyro.x * -1;
		const ngz = gyro.z * -1,
			mx = mouse.x + (ngz * ((width) / 3)),
			my = mouse.y + (ngx * ((height) / 2));
		if (mx && my) {
			robot.moveMouse(mx, my);
		}
		if (RJoyX || RJoyY) {
			robot.scrollMouse(RJoyX, RJoyY);
		}
		if (inputStates.ZR) {
			if (!this.leftClicking) {
				robot.mouseToggle("down");
				this.leftClicking = true;
			}
		} else {
			if (this.leftClicking) {
				robot.mouseToggle("up");
				this.leftClicking = false;
			}
		}
		if (inputStates.R) {
			if (!this.rightClicking) {
				robot.mouseToggle("down", "right");
				this.rightClicking = true;
			}
		} else {
			if (this.rightClicking) {
				robot.mouseToggle("up", "right");
				this.rightClicking = false;
			}
		}
	}

	private gyroHistory = [];
	private readonly deadZone: number = 0.005;

	private smoothGyroMouse(gyro) {

		if (this.gyroHistory.length < 3) {
			this.gyroHistory.push(gyro);
			return gyro; //smoothing not ready
		} else {
			this.gyroHistory.shift();
			this.gyroHistory.push(gyro);
			gyro.x = ((this.gyroHistory[0].x * 1) + (this.gyroHistory[1].x * 3) + (this.gyroHistory[2].x * 5)) / 9;
			gyro.y = ((this.gyroHistory[0].y * 1) + (this.gyroHistory[1].y * 3) + (this.gyroHistory[2].y * 5)) / 9;
			gyro.z = ((this.gyroHistory[0].z * 1) + (this.gyroHistory[1].z * 3) + (this.gyroHistory[2].z * 5)) / 9;
			if (gyro.x < this.deadZone && gyro.x > 0) {
				gyro.x = 0;
			} else if (gyro.x > -this.deadZone && gyro.x < 0) {
				gyro.x = 0;
			}
			if (gyro.y < this.deadZone && gyro.y > 0) {
				gyro.y = 0;
			} else if (gyro.y > -this.deadZone && gyro.y < 0) {
				gyro.y = 0;
			}
			if (gyro.z < this.deadZone && gyro.z > 0) {
				gyro.z = 0;
			} else if (gyro.z > -this.deadZone && gyro.z < 0) {
				gyro.z = 0;
			}
			return gyro;
		}
	}

	private plugControllerIn() {
		try {
			const nCid = vgen.pluginNext();
			this.controllerIds.push(nCid);
			console.log("Plugged in controller " + nCid + ".");
		}
		catch (e) {
			console.error("Could not plug in virtual controller. Make sure the driver is installed.");
			setTimeout(this.plugControllerIn, 3000);
		}
	}

	private touchX1Old: number = 0;
	private touchY1Old: number = 0;
	private screenScale: number = 1;

	public handleTouchInput(hid, [width, height]: [number, number]) {
		let touchX1 = hid.get("touchX1");
		let touchY1 = hid.get("touchY1");
		if (touchX1 && touchY1) {
			touchX1 -= 15;
			touchY1 -= 15;
			touchX1 = Math.floor(width * (touchX1 / 1280))
			touchY1 = Math.floor(height * (touchY1 / 720))
			if (!this.touchX1old) this.touchX1old = touchX1;
			if (!this.touchY1old) this.touchY1old = touchY1;
			var touchX2 = hid.get("touchX2");
			var touchY2 = hid.get("touchY2");
			if (touchX2 && touchY2) {
				this.rightTouchTime++;
				if (this.rightTouchTime > 5) { // Handle scrolling
					const xDiff = this.touchX1old - touchX1;
					const yDiff = this.touchY1old - touchY1;
					robot.scrollMouse(xDiff, yDiff);
					this.scrolling = true;
					this.touchRightClicking = false;
				} else { //Handle left click
					this.touchRightClicking = true;
				}
			} else {
				if (this.touchRightClicking) {
					robot.mouseClick("right");
					this.touchRightClicking = false
				}
				this.scrolling = false;
				this.rightTouchTime = 0;
			}
			if (!this.scrolling) {
				this.leftTouchTime++;
				if (Math.abs(touchX1 - this.touchX1old) > 5 || Math.abs(touchY1 - this.touchY1old) > 5) {
					robot.moveMouse(touchX1 / this.screenScale, touchY1 / this.screenScale);
				}
				if (!this.touchLeftClicking) {
					robot.mouseToggle("down");
					this.touchLeftClicking = true;
				}
			} else {
				robot.mouseToggle("up");
				this.touchLeftClicking = false;
			}
			this.touchX1old = touchX1;
			this.touchY1old = touchY1;
		} else {
			if (this.touchLeftClicking) { //release left click
				robot.mouseToggle("up");
				this.touchLeftClicking = false;
			}
			this.leftTouchTime = 0;
			this.rightTouchTime = 0;
		}
	}

	public handleGyroAndAccel(hid) {
		const gyro = { x: hid.get("gyroX"), y: hid.get("gyroY"), z: hid.get("gyroZ") }
		const accel = { x: hid.get("accelX"), y: hid.get("accelY"), z: hid.get("accelZ") }
		for (let axis in gyro) {
			gyro[axis] *= 250;
		}
		gyro.y *= -1;
		GyroServ.sendMotionData(gyro, accel);
	}
}

export default new SwitchControllerHandler();