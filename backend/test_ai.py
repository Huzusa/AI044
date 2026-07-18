import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.ai_service import (
    generate_outline,
    find_materials,
    expression_references,
    deep_questions,
    inspiration_fragments,
    analyze_article,
    generate_titles,
    polish_sentence,
    continue_writing,
    _call_llm
)

from flask import Flask
import json

app = Flask(__name__)
app.config['DASHSCOPE_API_KEY'] = 'sk-ws-H.EDHHRLY.7yJl.MEYCIQCXQwjDQeTlcFwjRNuFZvTRTl46EoPpFmVw0LMni_OlYwIhAOpcABmCcjDQq8gcCnv0lie4EBVU76EqU6AnuV3VdiRe'
app.config['QWEN_MODEL'] = 'qwen-plus'

test_results = {}

print("=" * 60)
print("正在测试 AI 接口...")
print("=" * 60)

with app.app_context():
    print("\n1. 结构参考 (generate_outline)")
    print("-" * 40)
    try:
        result = generate_outline("夏天、回忆、成长")
        test_results['generate_outline'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n2. 相关资料 (find_materials)")
    print("-" * 40)
    try:
        result = find_materials("胡同文化")
        test_results['find_materials'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n3. 表达参考 (expression_references)")
    print("-" * 40)
    try:
        result = expression_references("我很怀念小时候的夏天")
        test_results['expression_references'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n4. 深度反问 (deep_questions)")
    print("-" * 40)
    try:
        result = deep_questions("那年夏天，我第一次离开家去远方求学。火车站台上，母亲不停地叮嘱着。")
        test_results['deep_questions'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n5. 灵感骰子 (inspiration_fragments)")
    print("-" * 40)
    try:
        result = inspiration_fragments("遗憾")
        test_results['inspiration_fragments'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n6. 归纳分析 (analyze_article)")
    print("-" * 40)
    try:
        result = analyze_article("好文章存档", "文章由五则哲理故事组成，分别探讨心与外物的关系、大小选择的适配性、抉择力对人格的意义。")
        test_results['analyze_article'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n7. 标题生成 (generate_titles)")
    print("-" * 40)
    try:
        result = generate_titles("好文章存档", "文章由五则哲理故事组成，分别探讨心与外物的关系、大小选择的适配性、抉择力对人格的意义。")
        test_results['generate_titles'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n8. 句子润色 (polish_sentence)")
    print("-" * 40)
    try:
        result = polish_sentence("我觉得这个地方很漂亮", "描述一个旅行地点")
        test_results['polish_sentence'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

    print("\n9. 写作思路 (continue_writing)")
    print("-" * 40)
    try:
        result = continue_writing("那年夏天，我第一次离开家去远方求学。火车站台上，母亲不停地叮嘱着。", "全文关于离家求学的回忆")
        test_results['continue_writing'] = result
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"错误: {e}")

print("\n" + "=" * 60)
print("测试完成！")
print("=" * 60)

with open('ai_test_results.json', 'w', encoding='utf-8') as f:
    json.dump(test_results, f, ensure_ascii=False, indent=2)

print("\n结果已保存到 ai_test_results.json")