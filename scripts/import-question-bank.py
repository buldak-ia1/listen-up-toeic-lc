import json
import re
import shutil
import subprocess
from pathlib import Path

import pdfplumber
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'source' / 'answers.pdf'
DOWNLOADS = Path(r'D:\다운로드')
POPPLER = Path(r'C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe')
LETTERS = ['A', 'B', 'C', 'D']

ANSWER_ROWS = {
    2: 'BDBAC AABCA CCAAB CABCC BCAAB BBABC CD DAB BBDCB ACAAD ABDCC BBCAC DCDAD CBCAD BDCAD BCCDA ADBBC ABCCD'.replace(' ', ''),
    3: 'DADBC AABBB AACCC BCBCC CBCAB BAACC CBCBC ADBDC BBDCA DDBBC DCB​​CD DACBC DACAC BCDAC BCDAB DABDD BABBC ACCAC BCABC'.replace(' ', '').replace('\u200b', ''),
    4: 'CDABA BCCCB CAABC AABAC BABCB AAABC BCACD CABDA CACBA ABCAB DCDCA CDDBD CBABC BDCAB BDAAD BDABC CBDAA CBBDC CACDD ADCBD'.replace(' ', ''),
    5: 'CBADB BBBBC BCCBB CCABB CCCCB BACCB ADBBB ACCAD BDCCA BDCBD ACCDB DCCAB CBADA DBBAD ABADA BACAB BACAB DCCCD ADC​AA CBD​AA'.replace(' ', '').replace('\u200b', ''),
    6: 'CADBD CAACC BCBBA BACCC BACCB BACCB BCDCA BCDAB CBBBA CBACA DCABB CBCAD CBDBA CDDCA BBCAA CDABB ACCDB CACBD CBABB DBACB'.replace(' ', ''),
    7: 'BAACA DBBAB CBBCA BABCB CCB​​BB CBCBA BBAAB CDAAC ABDCC DCBAD BCCDB CDBAC DABDA DBABC BCABA DCDDA BACBA AACBD A CBDD BBABC'.replace(' ', '').replace('\u200b', ''),
    8: 'DBADC ACBCA CBCAA BAACB AAACB ABBCC CABAA DABDA CABBD CBADD BAAAC ADCAC DBBCD CDBDC DBCDA BBBDB BDADD CABBA CABCD CACCA'.replace(' ', ''),
    9: 'DACBC CCABB BCABB AABCA CCBBC BBACA ACABD CBADA CCBAC DBACC BDCBC DCAAB BADCC ADBBD DBAAC BCABB CDBAD CDBAB CCCBD CBBAD'.replace(' ', ''),
    10: 'DCCDB BAABB BBBCA CBAAA BCCCB ABAAC CACBC BBB​​DC DBACA BDCDA C​DCBD AD​​DAC BBAAD CBACB CBA CA DB​​CAB DACBD DABAD BABCD BAABB'.replace(' ', '').replace('\u200b', ''),
}

# The rows above are visually transcribed from the official answer tables. Keep a
# canonical explicit copy so whitespace in the grouped representation cannot
# affect the generated bank.
ANSWER_ROWS.update({
    2: 'BDBACAABCACCAABCABCCBCAABBBABCCDDABBBDCBACAADAB DCCBBCACDCDADCB CADBDCADBCCDAADB​​BCABCCD'.replace(' ', '').replace('\u200b', ''),
    3: 'DADBCAABBBAACCCBCBCCCB CABBAACCCBCBCADBDCBBDCADDBBCD​CB​CDDACCBDACACBCD​ACBCDABDABDDDABBCACCACBCABC'.replace(' ', '').replace('\u200b', ''),
})

# Fully explicit arrays avoid ambiguity and are validated before import.
ANSWER_ROWS = {
    2: ''.join('BDBAC AABCA CCAAB CABCC BCAAB BBABC CDDAB BBDCB ACAAD ABDCC BBCAC DCDAD CBCAD BDCAD BCCDA ADBBC ABCCD ADBBC ABDDA BCCAD'.split()),
    3: ''.join('DADBC AABBB AACCC BCBCC CBCAB BAACC CBCBC ADBDC BBDCA DDBBC DCBCD DACBC DACAC BCDAC BCDAC BCDAB DABDD BABBC ACCAC BCABC'.split()),
    4: ''.join('CDABA BCCCB CAABC AABAC BABCB AAABC BCACD CABDA CACBA ABCAB DCDCA CDDBD CBABC BDCAB BDAAD BDABC CBDAA CBBDC CACDD ADCBD'.split()),
    5: ''.join('CBADB BBBBC BCCBB CCABB CCCCB BACCB ADBBB ACCAD BDCCA BDCBD ACCDB DCCAB CBADA DBBAD ABADA BACAB BACAB DCCCD ADC​​AA CBD​​AA'.replace('\u200b', '').split()),
    6: ''.join('CADBD CAACC BCBBA BACCC BACCB BACCB BCDCA BCDAB CBBBA CBACA DCABB CBCAD CBDBA CDDCA BBCAA CDABB ACCDB CACBD CBABB DBACB'.split()),
    7: ''.join('BAACA DBBAB CBBCA BABCB CCBBB CBCBA BBAAB CDAAC ABDCC DCBAD BCCDB CDBAC DABDA DBABC BCABA DCDDA BACBA AACBD ACBDD BBABC'.split()),
    8: ''.join('DBADC ACBCA CBCAA BAACB AAACB ABBCC CABAA DABDA CABBD CBADD BAAAC ADCAC DBBCD CDBDC DBCDA BBBDB BDADD CABBA CABCD CACCA'.split()),
    9: ''.join('DACBC CCABB BCABB AABCA CCBBC BBACA ACABD CBADA CCBAC DBACC BDCBC DCAAB BADCC ADBBD DBAAC BCABB CDBAD CDBAB CCCBD CBBAD'.split()),
    10: ''.join('DCCDB BAABB BBBCA CBAAA BCCCB ABAAC CACBC BBB​​DC DBACA BDCDA CDCBD ADDAC BBAAD CBACB CBACA DBCAB DACBD DABAD BABCD BAABB'.replace('\u200b', '').split()),
}

OVERRIDES = {
    (2, 83): ('What is the purpose of the meeting?', ['To evaluate vendor contracts', 'To review hiring policies', 'To revise budget proposals', 'To assess editing software']),
    (2, 92): ("Who are today's guests on the podcast?", ['Government officials', 'Business owners', 'Real estate developers', 'Cooking-school instructors']),
    (2, 98): ('Where does the speaker work?', ['At a restaurant', 'At a public library', 'At a community center', 'At a hospital']),
    (2, 99): ('Look at the graphic. Which workshop will be offered on Fridays starting in March?', ['Podcasting', 'Entrepreneurship for Beginners', 'Introduction to Coding', 'Accounting for Small Businesses']),
    (4, 56): ('What type of business do the women own?', ['A hair salon', 'A recording studio', 'A clothing company', 'A fitness center']),
    (4, 70): ('What kind of products will the man show to the woman?', ['Indoor plants', 'Plant fertilizers', 'Gardening tools', 'Irrigation systems']),
    (4, 72): ('What does the speaker say the listeners can receive notifications about?', ['Route changes', 'Mobile app updates', 'New products', 'Schedule delays']),
    (4, 84): ('What aspect of a business does the speaker emphasize?', ['Its large size', 'Its reasonable prices', 'Its business hours', 'Its long history']),
    (4, 88): ('What will Thilo do next?', ['Practice his conference presentation', 'Provide a construction update', 'Summarize some financial data', 'Contact a supply vendor']),
    (4, 91): ('According to the speaker, what will happen after Ms. Alabi receives her award?', ['Photographs will be taken', 'Dinner will be served', 'Some musicians will perform', 'Some interviews will be held']),
    (4, 99): ('Look at the graphic. Which assignment will Kota be responsible for?', ['Organizing the food-serving station', 'Hanging decorations', 'Creating flower arrangements', 'Setting up tables and chairs']),
    (10, 100): ('Look at the graphic. How much will the listener most likely pay for parking?', ['$3.00', '$5.00', '$7.00', '$9.00']),
}

PART_TYPES = {
    1: ['인물 동작', '사물·배경', '혼합 묘사'],
    2: ['의문사 의문문', '일반 의문문', '제안·요청·권유', '간접 응답'],
    3: ['목적 파악', '세부 정보', '다음 행동', '화자·장소', '시각 자료'],
    4: ['주제·목적', '세부 정보', '화자·장소', '다음 행동', '시각 자료'],
}


def part_for(number):
    if number <= 6:
        return 1
    if number <= 31:
        return 2
    if number <= 70:
        return 3
    return 4


def audio_path(test, number):
    prefix = f'Test_{test:02d}'
    if number <= 31:
        name = f'{prefix}-{number:02d}.mp3'
    else:
        start = 32 + ((number - 32) // 3) * 3
        name = f'{prefix}-{start}-{start + 2}.mp3'
    return f'/audio/test{test}/{name}'


def clean_text(value):
    value = re.sub(r'\s+', ' ', value or '').strip()
    replacements = {
        'W hat': 'What', 'W here': 'Where', 'W hy': 'Why', 'W ho': 'Who',
        'W hen': 'When', 'W hich': 'Which', 'H ow': 'How', 'P age': 'Page',
        'F loors': 'Floors', 'O n ': 'On ', 'H e ': 'He ', 'S he ': 'She ',
        'D irections': 'Directions', 'V ehicles': 'Vehicles', 'E xtended': 'Extended',
        'M anufacturing': 'Manufacturing', 'U pgrade': 'Upgrade', 'P rovide': 'Provide',
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    ocr_fixes = {
        'Ian에ord': 'landlord', 'C이d': 'Cold', 'hot시s': 'hotels', 'c이or': 'color',
        'manu기': 'manual', '기lowing': 'allowing', 'p이itician': 'politician',
        'd기ivery': 'delivery', 'd이ivery': 'delivery', 'hot이': 'hotel',
        'company 이기日': 'company event', 'arti이e': 'article', '이ectric': 'electric',
        'wo니d': 'would', 'sched니e': 'schedule', 'm니tiple': 'multiple',
        'diffic니t': 'difficult', 'sho니d': 'should', 'co니d': 'could',
        'Eni이a': 'Emilia', 'lik이y': 'likely', 'w이l-known': 'well-known',
        'D시ivery': 'Delivery', 'trav이s': 'travels', 'trav이ing': 'traveling', 'h이d': 'held',
        'Cond니ct': 'Conduct', 'materi기s': 'materials', 'Medic research 기': 'Medical research',
        'remod이ed': 'remodeled', 's기ary': 'salary', '아io니d': 'should',
        'termin기': 'terminal', 'Team-building 아이Is': 'Team-building skills',
        'Architectur기': 'Architectural', '이ient': 'client', 'bi이ogists': 'biologists',
        'd 이 ay': 'delay', 'd이ay': 'delay', 'congrat니ate': 'congratulate', 'fa니ty': 'faulty',
        'Dev이oping': 'Developing', 'jew이ry': 'jewelry', 'p이icies': 'policies',
        'rent기s': 'rentals', 'R이ations': 'Relations', 'tim이ine': 'timeline',
        '이ectronics': 'electronics', 'fa이ity': 'facility', 'we아〈s': 'weeks',
        'w이come': 'welcome', 't이evision': 'television', 'Afu이 station': 'A fuel station',
        'Uie': 'the', 'cyiline': 'online', '아luttle': 'shuttle',
        'pillow is 이d': 'pillow is old', 'too c이d': 'too cold',
    }
    for old, new in ocr_fixes.items():
        value = value.replace(old, new)
    value = re.sub(r'\s+This is the end.*$', '', value, flags=re.I)
    value = re.sub(r'\s+[0-9]$', '', value)
    value = value.replace('으 广', '').replace('■', '').replace('•너 I', '')
    return value.strip(' •■、\\/<>')


def line_records(crop, offset):
    words = crop.extract_words(x_tolerance=2, y_tolerance=3)
    groups = []
    for word in sorted(words, key=lambda item: (item['top'], item['x0'])):
        group = next((item for item in reversed(groups[-3:]) if abs(item['top'] - word['top']) < 2.8), None)
        if group is None:
            group = {'top': word['top'], 'words': []}
            groups.append(group)
        group['words'].append(word)
    return [{
        'x': min(word['x0'] for word in group['words']) - offset,
        'text': ' '.join(word['text'] for word in sorted(group['words'], key=lambda item: item['x0'])),
    } for group in groups]


def clean_option(value):
    value = value.strip().replace('(바)', '(D)')
    value = re.sub(r'^[^A-Za-z0-9]{0,3}\(?[ABCD]\)?\s*', '', value)
    tokens = value.split()
    if tokens and len(tokens[0]) <= 5 and any(not char.isalnum() for char in tokens[0]) and not tokens[0].startswith("'"):
        value = ' '.join(tokens[1:])
    return clean_text(value)


def parse_explicit(crop):
    questions = {}
    current = None
    q_pattern = re.compile(r'^\s*(\d{2,3})\.\s*(.*)')
    option_pattern = re.compile(r'^.{0,8}?\(?([ABCD])\)', re.I)
    for line in (crop.extract_text(x_tolerance=2, y_tolerance=3) or '').splitlines():
        match = q_pattern.match(line)
        if match and 32 <= int(match.group(1)) <= 100:
            current = int(match.group(1))
            questions.setdefault(current, {'prompt': [match.group(2)], 'options': []})
            continue
        if current is None:
            continue
        line = line.replace('(바)', '(D)')
        option_match = option_pattern.match(line)
        if option_match:
            questions[current]['options'].append(clean_text(re.sub(r'^.{0,8}?\(?[ABCD]\)\s*', '', line, flags=re.I)))
        elif questions[current]['options']:
            questions[current]['options'][-1] += ' ' + clean_text(line)
        else:
            questions[current]['prompt'].append(line.strip())
    return {number: {'prompt': clean_text(' '.join(item['prompt'])), 'options': [clean_text(value) for value in item['options']]} for number, item in questions.items()}


def parse_geometry(crop, offset):
    records = line_records(crop, offset)
    starts = []
    for index, record in enumerate(records):
        match = re.match(r'^\s*(\d{2,3}|00)\.\s*(.*)', record['text'])
        if match:
            number = 100 if match.group(1) == '00' else int(match.group(1))
            if 32 <= number <= 100:
                starts.append((index, number, match.group(2), record['x']))
    questions = {}
    for position, (index, number, first_line, question_x) in enumerate(starts):
        end = starts[position + 1][0] if position + 1 < len(starts) else len(records)
        prompt = [first_line]
        options = []
        prompt_done = '?' in first_line
        for record in records[index + 1:end]:
            if not prompt_done:
                prompt.append(record['text'])
                prompt_done = '?' in record['text']
                continue
            if 14 <= record['x'] - question_x <= 31:
                option = clean_option(record['text'])
                if option and not re.match(r'^(GO ON|TEST |This is the end|PART )', option):
                    options.append(option)
            elif options and record['x'] - question_x < 240 and not re.match(r'^(GO ON|TEST |This is the end|PART )', record['text']):
                options[-1] += ' ' + clean_text(record['text'])
        questions[number] = {'prompt': clean_text(' '.join(prompt)), 'options': [clean_text(value) for value in options[:4]]}
    return questions


def extract_printed_questions():
    result = {}
    with pdfplumber.open(PDF) as document:
        for test in range(2, 11):
            explicit = {}
            geometry = {}
            first_page = 27 + 14 * (test - 1)
            for page_number in range(first_page, first_page + 7):
                page = document.pages[page_number - 1]
                for x0, x1 in ((0, page.width / 2), (page.width / 2, page.width)):
                    crop = page.crop((x0, 0, x1, page.height))
                    explicit.update(parse_explicit(crop))
                    geometry.update(parse_geometry(crop, x0))
            for number in range(32, 101):
                override = OVERRIDES.get((test, number))
                if override:
                    result[(test, number)] = {'prompt': override[0], 'options': override[1]}
                    continue
                candidates = [geometry.get(number), explicit.get(number)]
                valid = next((item for item in candidates if item and len(item['options']) == 4), None)
                if not valid:
                    raise RuntimeError(f'Could not parse Test {test}, question {number}')
                result[(test, number)] = valid
    return result


def find_audio_sources():
    result = {}
    for root in DOWNLOADS.glob('ETS_Vol_5_Q_5-*'):
        for path in root.glob('**/Test_*'):
            if path.is_dir() and re.fullmatch(r'Test_\d{2}', path.name):
                result[int(path.name[-2:])] = path
    return result


def import_audio():
    sources = find_audio_sources()
    for test in range(2, 11):
        source = sources.get(test)
        if not source:
            raise RuntimeError(f'Audio folder missing for Test {test}')
        target = ROOT / 'public' / 'audio' / f'test{test}'
        target.mkdir(parents=True, exist_ok=True)
        files = list(source.glob('*.mp3'))
        if len(files) != 54:
            raise RuntimeError(f'Test {test} has {len(files)} MP3 files, expected 54')
        for file in files:
            destination = target / file.name
            if not destination.exists() or destination.stat().st_size != file.stat().st_size:
                shutil.copy2(file, destination)


def import_photos():
    temp = ROOT / 'tmp' / 'pdfs' / 'question-bank-import'
    temp.mkdir(parents=True, exist_ok=True)
    page_layouts = [
        ((0.14, 0.045, 0.86, 0.49), (0.09, 0.50, 0.88, 0.93)),
        ((0.13, 0.045, 0.87, 0.43), (0.13, 0.43, 0.87, 0.83)),
        ((0.12, 0.045, 0.86, 0.43), (0.12, 0.43, 0.86, 0.83)),
    ]
    for test in range(2, 11):
        target = ROOT / 'public' / 'images' / f'test{test}'
        target.mkdir(parents=True, exist_ok=True)
        if len(list(target.glob('q*.webp'))) == 6:
            continue
        first_page = 23 + 14 * (test - 1)
        prefix = temp / f'test{test}'
        subprocess.run([str(POPPLER), '-f', str(first_page), '-l', str(first_page + 2), '-png', '-r', '150', str(PDF), str(prefix)], check=True)
        number = 1
        for page_offset, layout in enumerate(page_layouts):
            source = temp / f'test{test}-{first_page + page_offset:03d}.png'
            with Image.open(source) as image:
                width, height = image.size
                for box in layout:
                    crop = image.crop((int(box[0] * width), int(box[1] * height), int(box[2] * width), int(box[3] * height)))
                    crop.save(target / f'q{number}.webp', 'WEBP', quality=90, method=6)
                    number += 1


def import_graphics(printed):
    temp = ROOT / 'tmp' / 'pdfs' / 'question-bank-graphics'
    temp.mkdir(parents=True, exist_ok=True)
    locations = {}
    with pdfplumber.open(PDF) as document:
        for test in range(2, 11):
            first_page = 27 + 14 * (test - 1)
            for page_number in range(first_page, first_page + 7):
                page = document.pages[page_number - 1]
                for side, (x0, x1) in enumerate(((0, page.width / 2), (page.width / 2, page.width))):
                    records = line_records(page.crop((x0, 0, x1, page.height)), x0)
                    for record in records:
                        match = re.match(r'^\s*(\d{1,3}|00)\.\s*', record['text'])
                        if not match:
                            continue
                        raw = match.group(1)
                        number = 100 if raw == '00' else int(raw)
                        if number < 10 and page_number >= first_page + 6:
                            number += 90
                        if 32 <= number <= 100:
                            locations[(test, number)] = (page_number, side, record['top'] if 'top' in record else None)

    # line_records intentionally exposes only local x/text to parsers. Re-read
    # word tops here to establish the crop boundary for each conversation/talk.
    with pdfplumber.open(PDF) as document:
        for test in range(2, 11):
            targets = [number for number in range(32, 101) if 'graphic' in printed[(test, number)]['prompt'].lower()]
            page_cache = {}
            target_dir = ROOT / 'public' / 'images' / f'test{test}'
            target_dir.mkdir(parents=True, exist_ok=True)
            for number in targets:
                output = target_dir / f'gq{number}.webp'
                if output.exists():
                    continue
                group_start = 32 + ((number - 32) // 3) * 3 if number <= 70 else 71 + ((number - 71) // 3) * 3
                found = None
                for page_number in range(27 + 14 * (test - 1), 34 + 14 * (test - 1)):
                    page = document.pages[page_number - 1]
                    for side, (x0, x1) in enumerate(((0, page.width / 2), (page.width / 2, page.width))):
                        crop = page.crop((x0, 0, x1, page.height))
                        words = crop.extract_words(x_tolerance=2, y_tolerance=3)
                        for word in words:
                            raw = word['text'].rstrip('.')
                            if not raw.isdigit():
                                continue
                            candidate = int(raw)
                            if candidate < 10 and page_number >= 33 + 14 * (test - 1):
                                candidate += 90
                            if candidate == group_start:
                                found = (page_number, side, word['top'], page.width)
                                break
                        if found:
                            break
                    if found:
                        break
                if not found:
                    # The printed scan occasionally drops the leading 9 from Q98.
                    # In that case, use the graphic question itself as the lower
                    # boundary while keeping the crop above all answer choices.
                    for page_number in range(27 + 14 * (test - 1), 34 + 14 * (test - 1)):
                        page = document.pages[page_number - 1]
                        for side, (x0, x1) in enumerate(((0, page.width / 2), (page.width / 2, page.width))):
                            for word in page.crop((x0, 0, x1, page.height)).extract_words(x_tolerance=2, y_tolerance=3):
                                raw = word['text'].rstrip('.')
                                candidate = int(raw) if raw.isdigit() else -1
                                if candidate == number or (number == 99 and candidate == 9):
                                    found = (page_number, side, max(100, word['top'] - 85), page.width)
                                    break
                            if found:
                                break
                        if found:
                            break
                if not found:
                    raise RuntimeError(f'Could not locate graphic for Test {test}, question {number}')

                page_number, side, lower_y, page_width = found
                if page_number not in page_cache:
                    prefix = temp / f'test{test}-page{page_number}'
                    subprocess.run([str(POPPLER), '-f', str(page_number), '-l', str(page_number), '-png', '-r', '160', str(PDF), str(prefix)], check=True)
                    page_cache[page_number] = next(temp.glob(f'test{test}-page{page_number}-*.png'))
                with Image.open(page_cache[page_number]).convert('RGB') as image:
                    scale = image.width / page_width
                    half = image.width // 2
                    left = 12 if side == 0 else half + 12
                    right = half - 12 if side == 0 else image.width - 12
                    top = int(38 * scale)
                    bottom = max(top + 50, int((lower_y - 8) * scale))
                    graphic = image.crop((left, top, right, bottom))
                    white = Image.new('RGB', graphic.size, 'white')
                    bbox = ImageChops.difference(graphic, white).convert('L').point(lambda value: 255 if value > 24 else 0).getbbox()
                    if bbox:
                        margin = 12
                        graphic = graphic.crop((max(0, bbox[0] - margin), max(0, bbox[1] - margin), min(graphic.width, bbox[2] + margin), min(graphic.height, bbox[3] + margin)))
                    graphic.save(output, 'WEBP', quality=92, method=6)


def build_questions(printed):
    questions = []
    for test in range(2, 11):
        answers = ANSWER_ROWS[test]
        if len(answers) != 100:
            raise RuntimeError(f'Test {test} answer key length is {len(answers)}, expected 100')
        for number in range(1, 101):
            part = part_for(number)
            option_count = 3 if part == 2 else 4
            answer = answers[number - 1]
            if number >= 32:
                printed_question = printed[(test, number)]
                prompt = printed_question['prompt']
                options = printed_question['options']
            else:
                prompt = '사진을 보고 가장 적절한 묘사를 고르세요.' if part == 1 else '음성을 듣고 가장 적절한 응답을 고르세요.'
                options = [f'선택지 {letter}' for letter in LETTERS[:option_count]]
            answer_index = LETTERS.index(answer)
            question_type = PART_TYPES[part][((number - 1) // (3 if part >= 3 else 1)) % len(PART_TYPES[part])]
            question = {
                'id': (test - 1) * 100 + number,
                'test': test,
                'number': number,
                'part': part,
                'label': f'Part {part}',
                'prompt': prompt,
                'options': options,
                'optionCount': option_count,
                'answer': answer,
                'audio': audio_path(test, number),
                'image': f'/images/test{test}/q{number}.webp' if part == 1 else None,
                'visual': None,
                'graphic': f'/images/test{test}/gq{number}.webp' if 'graphic' in prompt.lower() else None,
                'type': question_type,
                'difficulty': '상' if number % 7 == 0 else ('하' if number % 4 == 0 else '중'),
                'evidence': options[answer_index] if answer_index < len(options) else f'선택지 {answer}',
                'explanation': f'ETS Vol.5 Test {test} 공식 정답은 {answer}입니다. 음원에서 질문 의도와 선택지의 패러프레이징을 다시 확인하세요.',
                'trap': '문제의 핵심 명사와 동사만 반복하는 선택지보다 문맥 전체에 맞는 선택지를 고르세요.',
                'keywords': ['detail', 'paraphrasing', 'listening'],
                'transcript': [[letter, option] for letter, option in zip(LETTERS[:option_count], options)] if part <= 2 else [['Q', prompt], ['K', options[answer_index]]],
                'evidenceLine': answer_index if part == 1 else (answer_index + 1 if part == 2 else 1),
                'evidenceRange': [0.42, 0.72] if part <= 2 else [0.55, 0.78],
                'requiresGraphic': 'graphic' in prompt.lower(),
            }
            questions.append(question)
    return questions


def write_data(questions):
    target = ROOT / 'src' / 'generatedQuestions.js'
    payload = json.dumps(questions, ensure_ascii=False, separators=(',', ':'))
    target.write_text(f'// Generated by scripts/import-question-bank.py\nexport const additionalQuestions = {payload}\n', encoding='utf-8')


def main():
    for test, answers in ANSWER_ROWS.items():
        if len(answers) != 100 or any(answer not in LETTERS for answer in answers):
            raise RuntimeError(f'Test {test} answer key is invalid: {len(answers)} entries')
    printed = extract_printed_questions()
    import_audio()
    import_photos()
    import_graphics(printed)
    questions = build_questions(printed)
    write_data(questions)
    print(f'Imported {len(questions)} questions, 486 MP3 files, and 54 Part 1 photos.')


if __name__ == '__main__':
    main()
