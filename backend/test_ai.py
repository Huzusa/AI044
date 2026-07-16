import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from services.ai_service import inspiration_fragments

print("=== 测试千问 API ===")
print()

try:
    app = create_app()
    with app.app_context():
        print(f"DASHSCOPE_API_KEY: {app.config['DASHSCOPE_API_KEY'][:10]}...")
        print(f"QWEN_MODEL: {app.config['QWEN_MODEL']}")
        print()
        
        print("正在调用灵感骰子 API...")
        result = inspiration_fragments("夏天")
        if result:
            print("✓ AI 调用成功！")
            print()
            print("返回结果：")
            print("感官细节:", result.get('sensory', []))
            print("微场景:", result.get('scenes', []))
            print("微小冲突:", result.get('conflicts', []))
        else:
            print("✗ AI 调用失败")
            
except Exception as e:
    print(f"✗ 测试失败: {str(e)}")
    import traceback
    traceback.print_exc()
