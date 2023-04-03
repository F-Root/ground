const icons = Object.freeze({
	drawer: `<svg
						xmlns="http://www.w3.org/2000/svg"
						width="26"
						height="26"
						fill="currentColor"
						class="bi bi-list"
						viewBox="0 0 16 16"
					>
						<path
							fill-rule="evenodd"
							d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
						/>
					</svg>`,
	search: `<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							fill="currentColor"
							class="bi bi-search"
							viewBox="0 0 16 16"
						>
							<path
								d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
							/>
						</svg>`,
	favicon: `<svg
						version="1.0"
						xmlns="http://www.w3.org/2000/svg"
						width="30"
						height="30"
						viewBox="0 0 500.000000 500.000000"
						preserveAspectRatio="xMidYMid meet"
					>
						<g transform="translate(0.000000,500.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
							<path
								d="M2320 4994 c-19 -2 -78 -9 -130 -15 -886 -101 -1680 -716 -2014
-1559 -120 -304 -171 -578 -171 -920 0 -353 54 -632 181 -945 127 -309 305
-576 549 -821 398 -399 878 -634 1460 -716 119 -17 504 -16 620 1 292 43 549
121 790 241 758 376 1258 1077 1376 1930 18 125 18 507 0 625 -84 575 -320
1054 -711 1445 -145 146 -246 229 -405 333 -308 201 -634 324 -1015 382 -100
15 -454 28 -530 19z m-1461 -2035 c71 -16 146 -58 197 -110 42 -43 46 -51 37
-72 -14 -30 -111 -147 -122 -147 -5 0 -30 17 -56 39 -76 63 -163 78 -242 42
-111 -51 -155 -224 -90 -350 29 -57 105 -101 175 -101 62 0 164 29 158 45 -2
7 -8 60 -11 117 l-7 104 133 -2 134 -1 6 -244 c3 -134 4 -246 2 -249 -2 -2
-39 3 -81 12 -73 14 -82 14 -172 -4 -121 -25 -258 -21 -340 12 -121 48 -223
156 -260 277 -27 89 -28 237 0 324 47 155 179 280 323 309 60 11 165 11 216
-1z m3823 -86 c-8 -107 -10 -671 -3 -768 l5 -60 -110 0 -109 0 -3 31 -3 32
-50 -34 c-58 -39 -100 -49 -175 -41 -157 16 -257 143 -257 327 0 112 28 186
93 251 88 88 234 105 328 39 l45 -31 -4 163 -4 163 105 11 c58 6 115 12 127
13 22 1 22 0 15 -96z m-2459 -216 c64 -32 120 -90 150 -156 31 -66 31 -216 0
-282 -30 -66 -86 -124 -151 -156 -50 -25 -68 -28 -152 -28 -84 0 -102 3 -152
28 -116 57 -173 158 -172 302 1 154 79 266 217 311 69 23 193 13 260 -19z
m-739 -15 l6 -39 67 34 c50 25 78 33 108 31 l40 -3 -4 -110 c-1 -60 -5 -113
-8 -117 -2 -5 -34 -8 -71 -8 -113 0 -112 2 -112 -211 l0 -180 -117 3 -118 3
-1 235 c-1 138 -6 254 -12 280 -22 87 -23 86 81 103 139 22 134 23 141 -21z
m2000 -6 l7 -44 68 40 c85 49 158 60 225 34 54 -21 103 -73 111 -118 3 -18 5
-139 3 -268 l-3 -235 -104 -3 c-66 -2 -108 1 -115 8 -7 7 -11 76 -11 193 0
191 -6 220 -45 232 -29 9 -74 -3 -99 -26 -20 -19 -21 -29 -21 -202 0 -129 -4
-187 -12 -195 -13 -13 -183 -17 -212 -6 -14 5 -16 35 -16 231 0 123 -5 256
-11 294 -6 39 -9 72 -7 74 3 4 180 31 214 34 18 1 23 -6 28 -43z m-764 -41
c-3 -33 -5 -117 -4 -187 0 -101 4 -131 17 -152 29 -44 89 -47 138 -7 23 19 24
24 29 213 l5 193 120 0 120 0 -2 -305 c-1 -168 -3 -308 -3 -312 0 -5 -51 -8
-114 -8 l-114 0 -6 44 -7 44 -70 -41 c-148 -85 -296 -47 -334 87 -21 75 -28
237 -16 354 16 148 10 143 139 140 l107 -3 -5 -60z"
							/>
							<path
								d="M4269 2475 c-37 -20 -63 -84 -56 -137 7 -55 61 -108 108 -108 67 0
119 57 119 130 0 97 -91 159 -171 115z"
							/>
							<path
								d="M2018 2474 c-83 -44 -75 -198 12 -234 76 -31 150 27 150 119 0 101
-81 159 -162 115z"
							/>
						</g>
					</svg>`,
	github: `<svg
						version="1.0"
						xmlns="http://www.w3.org/2000/svg"
						width="30"
						height="30"
						viewBox="0 0 240.000000 240.000000"
						preserveAspectRatio="xMidYMid meet"
					>
						<g transform="translate(0.000000,240.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
							<path
								d="M970 2301 c-305 -68 -555 -237 -727 -493 -301 -451 -241 -1056 143
-1442 115 -116 290 -228 422 -271 49 -16 55 -16 77 -1 24 16 25 20 25 135 l0
118 -88 -5 c-103 -5 -183 13 -231 54 -17 14 -50 62 -73 106 -38 74 -66 108
-144 177 -26 23 -27 24 -9 37 43 32 130 1 185 -65 96 -117 133 -148 188 -160
49 -10 94 -6 162 14 9 3 21 24 27 48 6 23 22 58 35 77 l24 35 -81 16 c-170 35
-275 96 -344 200 -64 96 -85 179 -86 334 0 146 16 206 79 288 28 36 31 47 23
68 -15 36 -11 188 5 234 13 34 20 40 47 43 45 5 129 -24 214 -72 l73 -42 64
15 c91 21 364 20 446 0 l62 -16 58 35 c77 46 175 82 224 82 39 0 39 -1 55 -52
17 -59 20 -166 5 -217 -8 -30 -6 -39 16 -68 109 -144 121 -383 29 -579 -62
-129 -193 -219 -369 -252 l-84 -16 31 -55 32 -56 3 -223 4 -223 25 -16 c23
-15 28 -15 76 2 80 27 217 101 292 158 446 334 590 933 343 1431 -145 293
-419 518 -733 602 -137 36 -395 44 -525 15z"
							/>
						</g></svg
				>`,
});

export { icons };
